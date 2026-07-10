alter table if exists user_profiles add column if not exists skin_feel varchar(255);
alter table if exists user_profiles add column if not exists post_wash_feel varchar(255);
alter table if exists user_profiles add column if not exists main_goal varchar(255);
alter table if exists user_profiles add column if not exists product_fit_intent varchar(255);
alter table if exists user_profiles add column if not exists reaction_history varchar(255);
alter table if exists user_profiles add column if not exists current_routine varchar(255) array;
alter table if exists user_profiles add column if not exists recent_actives varchar(255) array;
alter table if exists user_profiles add column if not exists reminder_preferences varchar(255) array;
alter table if exists user_profiles add column if not exists gender varchar(255);
alter table if exists user_profiles add column if not exists is_pregnant boolean;
alter table if exists user_profiles add column if not exists conditions varchar(255) array;
alter table if exists user_profiles add column if not exists allergens varchar(255) array;
alter table if exists user_profiles add column if not exists is_onboarded boolean;

create unique index if not exists idx_user_profiles_user_id_unique on user_profiles(user_id);

alter table if exists user_products add column if not exists cutout_image_url varchar(255);
alter table if exists user_products add column if not exists is_favorite boolean;
alter table if exists user_products add column if not exists active_ingredients varchar(255) array;
alter table if exists user_products add column if not exists created_at timestamp(6);
alter table if exists user_products add column if not exists updated_at timestamp(6);

create index if not exists idx_user_products_user_id_created_at on user_products(user_id, created_at desc);
