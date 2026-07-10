const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8080/api';
const password = 'Test123!';

const scenarios = [
  {
    email: 'test-kuru@example.com',
    firstName: 'Test',
    lastName: 'Kuru',
    profile: {
      displayName: 'Test Kuru',
      ageRange: '18-24',
      experienceLevel: 'Yeni başlıyorum',
      skinFeel: 'Hep kuru / gergin',
      postWashFeel: 'Gerginlik ve kuruluk oluyor',
      mainGoal: 'Kızarıklık / hassasiyet',
      sensitivityLevel: 'Evet, sık sık kızarır/yanar',
      skinType: 'Kuru Cilt',
      trackingPreferences: ['Uyku', 'Stres'],
      reminderPreferences: ['Akşam rutinim için'],
      isOnboarded: true,
    },
    product: {
      name: 'Kuru Cilt Nemlendirici',
      brand: 'La Roche-Posay',
      category: 'Nemlendirici',
      timeOfDay: 'both',
      imageUrl: '',
      description: 'Hassas ciltler için bariyer destekli nemlendirici.',
      activeIngredients: ['Glycerin', 'Niacinamide'],
      isFavorite: true,
    },
    prompt: 'Cildim kızardı ve tepki verdi',
  },
  {
    email: 'test-yagli@example.com',
    firstName: 'Test',
    lastName: 'Yagli',
    profile: {
      displayName: 'Test Yagli',
      ageRange: '25-34',
      experienceLevel: 'Aktif içerikleri biliyorum',
      skinFeel: 'Genel olarak yağlı',
      postWashFeel: 'Hızlıca yağlanıyor',
      mainGoal: 'Sivilce / komedon görünümü',
      sensitivityLevel: 'Bazen',
      skinType: 'Yağlı Cilt',
      trackingPreferences: ['Regl dönemi', 'Beslenme'],
      reminderPreferences: ['Ürün kullanım takibi için'],
      isOnboarded: true,
    },
    product: {
      name: 'Yagli Cilt BHA',
      brand: 'Paula’s Choice',
      category: 'Tonik',
      timeOfDay: 'evening',
      imageUrl: '',
      description: 'Salisilik asit içeren gözenek bakım ürünü.',
      activeIngredients: ['Salicylic Acid'],
      isFavorite: false,
    },
    prompt: 'Bu iki ürün birlikte kullanılır mı?',
  },
  {
    email: 'test-karma@example.com',
    firstName: 'Test',
    lastName: 'Karma',
    profile: {
      displayName: 'Test Karma',
      ageRange: '35+',
      experienceLevel: 'Rutinim detaylı',
      skinFeel: 'T bölgesi yağlı, yanaklar normal',
      postWashFeel: 'Burun çevresi hızlı yağlanıyor',
      mainGoal: 'Daha düzenli rutin',
      sensitivityLevel: 'Hayır, genelde dayanıklı',
      skinType: 'Karma Cilt',
      currentRoutine: ['Temizleyici', 'Nemlendirici', 'Güneş kremi'],
      trackingPreferences: ['Su tüketimi', 'Güneşe maruz kalma'],
      reminderPreferences: ['Sabah rutinim için', 'Haftalık cilt özeti için'],
      isOnboarded: true,
    },
    product: {
      name: 'Daily SPF 50',
      brand: 'Beauty of Joseon',
      category: 'Güneş Kremi',
      timeOfDay: 'morning',
      imageUrl: '',
      description: 'Gündüz rutini için SPF ürünü.',
      activeIngredients: ['Sunscreen Filters'],
      isFavorite: true,
    },
    prompt: 'Bugünkü rutinim ağır mı?',
  },
];

class ApiError extends Error {
  constructor(status, method, path, data) {
    super(`${method} ${path} failed: ${status} ${JSON.stringify(data)}`);
    this.status = status;
    this.data = data;
  }
}

const parseBody = (text) => {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const request = async (path, options = {}) => {
  const method = options.method || 'GET';
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const text = await response.text();
  const data = parseBody(text);
  if (!response.ok) {
    throw new ApiError(response.status, method, path, data);
  }
  return data;
};

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });

const getSession = async (scenario) => {
  try {
    const auth = await request('/auth/register', {
      method: 'POST',
      body: {
        email: scenario.email,
        password,
        firstName: scenario.firstName,
        lastName: scenario.lastName,
      },
    });
    return { auth, mode: 'created' };
  } catch (error) {
    const alreadyExists = error instanceof ApiError
      && error.status === 400
      && String(error.data?.message || '').includes('zaten');

    if (!alreadyExists) {
      throw error;
    }

    const auth = await request('/auth/login', {
      method: 'POST',
      body: {
        email: scenario.email,
        password,
      },
    });
    return { auth, mode: 'existing' };
  }
};

const upsertProduct = async (headers, product) => {
  const products = await request('/products', { headers });
  const existingProduct = products.find((item) => item.name === product.name && item.brand === product.brand);

  if (!existingProduct) {
    return request('/products', {
      method: 'POST',
      headers,
      body: product,
    });
  }

  return request(`/products/${existingProduct.id}`, {
    method: 'PUT',
    headers,
    body: product,
  });
};

const verified = [];
const health = await request('/health');

if (health?.status !== 'ok') {
  throw new Error(`Health check failed: ${JSON.stringify(health)}`);
}

for (const scenario of scenarios) {
  const { auth, mode } = await getSession(scenario);

  const headers = authHeaders(auth.token);
  const profile = await request('/profiles/me', {
    method: 'PUT',
    headers,
    body: scenario.profile,
  });

  const product = await upsertProduct(headers, scenario.product);
  const products = await request('/products', { headers });
  const ingredientAnalysis = await request('/assistant/analyze-ingredients', {
    method: 'POST',
    headers,
    body: {
      name: scenario.product.name,
      brand: scenario.product.brand,
      category: scenario.product.category,
      description: scenario.product.description,
      activeIngredients: scenario.product.activeIngredients,
    },
  });
  const assistant = await request('/assistant/chat', {
    method: 'POST',
    headers,
    body: { message: scenario.prompt },
  });

  if (!products.some((item) => item.id === product.id)) {
    throw new Error(`Product is missing from product list for ${scenario.email}`);
  }

  verified.push({
    email: scenario.email,
    mode,
    userId: String(auth.user.id),
    displayName: profile.displayName,
    skinType: profile.skinType,
    mainGoal: profile.mainGoal,
    productName: product.name,
    productId: product.id,
    ingredientAnalysisLevel: ingredientAnalysis.compatibilityLevel,
    suggestedTimeOfDay: ingredientAnalysis.suggestedTimeOfDay,
    assistantIntent: assistant.intentType,
  });
}

console.log(JSON.stringify({ apiBaseUrl, health, verified }, null, 2));
