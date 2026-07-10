const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8080/api';
const runId = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);

const scenarios = [
  {
    slug: 'sensitive',
    firstName: 'Test',
    lastName: 'Sensitive',
    profile: {
      displayName: 'Test Sensitive',
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
      name: 'Toleriane Sensitive',
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
    slug: 'acne',
    firstName: 'Test',
    lastName: 'Acne',
    profile: {
      displayName: 'Test Acne',
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
      name: 'BHA Liquid',
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
    slug: 'routine',
    firstName: 'Test',
    lastName: 'Routine',
    profile: {
      displayName: 'Test Routine',
      ageRange: '35+',
      experienceLevel: 'Rutinim detaylı',
      skinFeel: 'Normal / dengeli',
      postWashFeel: 'Pek değişmiyor',
      mainGoal: 'Daha düzenli rutin',
      sensitivityLevel: 'Hayır, genelde dayanıklı',
      skinType: 'Normal Cilt',
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

const request = async (path, options = {}) => {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${path} failed: ${response.status} ${text}`);
  }
  return data;
};

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });

const created = [];

for (const scenario of scenarios) {
  const email = `skinshelf-test-${scenario.slug}-${runId}@example.com`;
  const auth = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password: 'Test123!',
      firstName: scenario.firstName,
      lastName: scenario.lastName,
    }),
  });

  const headers = authHeaders(auth.token);
  const profile = await request('/profiles/me', {
    method: 'PUT',
    headers,
    body: JSON.stringify(scenario.profile),
  });

  const product = await request('/products', {
    method: 'POST',
    headers,
    body: JSON.stringify(scenario.product),
  });

  const products = await request('/products', { headers });
  const assistant = await request('/assistant/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({ message: scenario.prompt }),
  });

  if (!products.some((item) => item.id === product.id)) {
    throw new Error(`Created product is missing from product list for ${email}`);
  }

  created.push({
    email,
    userId: String(auth.user.id),
    displayName: profile.displayName,
    productId: product.id,
    assistantIntent: assistant.intentType,
  });
}

console.log(JSON.stringify({ apiBaseUrl, created }, null, 2));
