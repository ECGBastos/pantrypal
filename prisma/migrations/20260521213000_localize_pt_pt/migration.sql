-- Localize the MVP demo/default data to European Portuguese.
UPDATE households SET name = 'Casa' WHERE name = 'Our Pantry';

UPDATE users SET name = 'Tu' WHERE name = 'You';
UPDATE users SET name = 'Parceira' WHERE name = 'Partner';

UPDATE categories SET name = 'Fruta e legumes' WHERE name = 'Produce';
UPDATE categories SET name = 'Carne e peixe' WHERE name = 'Meat & Fish';
UPDATE categories SET name = 'Laticínios' WHERE name = 'Dairy';
UPDATE categories SET name = 'Padaria' WHERE name = 'Bakery';
UPDATE categories SET name = 'Despensa' WHERE name = 'Pantry';
UPDATE categories SET name = 'Congelados' WHERE name = 'Frozen';
UPDATE categories SET name = 'Bebidas' WHERE name = 'Drinks';
UPDATE categories SET name = 'Limpeza' WHERE name = 'Cleaning';
UPDATE categories SET name = 'Higiene pessoal' WHERE name = 'Personal care';
UPDATE categories SET name = 'Outro' WHERE name = 'Other';

UPDATE notification_preferences SET reminder_day = 'Segunda' WHERE reminder_day = 'Monday';
UPDATE notification_preferences SET reminder_day = 'Terça' WHERE reminder_day = 'Tuesday';
UPDATE notification_preferences SET reminder_day = 'Quarta' WHERE reminder_day = 'Wednesday';
UPDATE notification_preferences SET reminder_day = 'Quinta' WHERE reminder_day = 'Thursday';
UPDATE notification_preferences SET reminder_day = 'Sexta' WHERE reminder_day = 'Friday';
UPDATE notification_preferences SET reminder_day = 'Sábado' WHERE reminder_day = 'Saturday';
UPDATE notification_preferences SET reminder_day = 'Domingo' WHERE reminder_day = 'Sunday';

UPDATE inventory_items SET location = 'Frigorífico' WHERE location = 'Fridge';
UPDATE inventory_items SET location = 'Congelador' WHERE location = 'Freezer';
UPDATE inventory_items SET location = 'Despensa' WHERE location = 'Pantry';
UPDATE inventory_items SET location = 'Casa de banho' WHERE location = 'Bathroom';
UPDATE inventory_items SET location = 'Lava-loiça' WHERE location = 'Sink';
UPDATE inventory_items SET location = 'Lavandaria' WHERE location = 'Laundry';
UPDATE inventory_items SET location = 'Casa' WHERE location = 'Home';

UPDATE known_items SET name = 'Abacates', normalized_name = 'abacates', default_unit = 'un.' WHERE normalized_name = 'avocados';
UPDATE known_items SET name = 'Espinafres biológicos', normalized_name = 'espinafres biológicos', default_unit = 'saco' WHERE normalized_name = 'organic spinach';
UPDATE known_items SET name = 'Bebida de aveia', normalized_name = 'bebida de aveia', default_unit = 'emb.' WHERE normalized_name = 'oat milk';
UPDATE known_items SET name = 'Arroz basmati', normalized_name = 'arroz basmati' WHERE normalized_name = 'basmati rice';
UPDATE known_items SET name = 'Feijão preto', normalized_name = 'feijão preto', default_unit = 'latas' WHERE normalized_name = 'black beans';
UPDATE known_items SET name = 'Detergente da loiça', normalized_name = 'detergente da loiça', default_unit = 'frasco' WHERE normalized_name = 'dish soap';
UPDATE known_items SET name = 'Café espresso', normalized_name = 'café espresso', default_unit = 'pacote' WHERE normalized_name = 'espresso roast';
UPDATE known_items SET name = 'Iogurte grego', normalized_name = 'iogurte grego', default_unit = 'emb.' WHERE normalized_name = 'greek yogurt';
UPDATE known_items SET name = 'Pão de massa mãe', normalized_name = 'pão de massa mãe', default_unit = 'un.' WHERE normalized_name = 'sourdough loaf';

UPDATE shopping_items SET name = 'Abacates', normalized_name = 'abacates', unit = 'un.', note = 'Escolher os maduros' WHERE normalized_name = 'avocados';
UPDATE shopping_items SET name = 'Espinafres biológicos', normalized_name = 'espinafres biológicos', unit = 'saco', note = 'Saco grande para batidos' WHERE normalized_name = 'organic spinach';
UPDATE shopping_items SET name = 'Bebida de aveia', normalized_name = 'bebida de aveia', unit = 'emb.', note = 'Versão cremosa' WHERE normalized_name = 'oat milk';
UPDATE shopping_items SET name = 'Arroz basmati', normalized_name = 'arroz basmati' WHERE normalized_name = 'basmati rice';
UPDATE shopping_items SET name = 'Feijão preto', normalized_name = 'feijão preto', unit = 'latas' WHERE normalized_name = 'black beans';
UPDATE shopping_items SET name = 'Iogurte grego', normalized_name = 'iogurte grego', unit = 'emb.' WHERE normalized_name = 'greek yogurt';
UPDATE shopping_items SET name = 'Pão integral', normalized_name = 'pão integral', unit = 'un.' WHERE normalized_name = 'whole wheat bread';

UPDATE inventory_items SET name = 'Leite', normalized_name = 'leite', unit = 'L', note = 'Usar antes do fim de semana' WHERE normalized_name = 'whole milk';
UPDATE inventory_items SET name = 'Morangos', normalized_name = 'morangos', unit = 'caixas', note = 'Bons para batidos' WHERE normalized_name = 'organic strawberries';
UPDATE inventory_items SET name = 'Pão de massa mãe', normalized_name = 'pão de massa mãe', unit = 'un.', note = 'Comprado fresco' WHERE normalized_name = 'sourdough loaf';
UPDATE inventory_items SET name = 'Flocos de aveia', normalized_name = 'flocos de aveia', note = 'Para pequeno-almoço' WHERE normalized_name = 'steel cut oats';
UPDATE inventory_items SET name = 'Detergente da loiça', normalized_name = 'detergente da loiça', unit = 'frasco' WHERE normalized_name = 'dish soap';

PRAGMA defer_foreign_keys = ON;
PRAGMA foreign_keys = OFF;

CREATE TABLE "new_notification_preferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "household_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "low_stock_reminders_enabled" BOOLEAN NOT NULL DEFAULT true,
    "weekly_shopping_reminder_enabled" BOOLEAN NOT NULL DEFAULT false,
    "unchecked_items_reminder_enabled" BOOLEAN NOT NULL DEFAULT false,
    "reminder_day" TEXT NOT NULL DEFAULT 'Sábado',
    "reminder_time" TEXT NOT NULL DEFAULT '10:00',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "notification_preferences_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_notification_preferences" ("id", "household_id", "user_id", "enabled", "low_stock_reminders_enabled", "weekly_shopping_reminder_enabled", "unchecked_items_reminder_enabled", "reminder_day", "reminder_time", "created_at", "updated_at")
SELECT "id", "household_id", "user_id", "enabled", "low_stock_reminders_enabled", "weekly_shopping_reminder_enabled", "unchecked_items_reminder_enabled", "reminder_day", "reminder_time", "created_at", "updated_at"
FROM "notification_preferences";

DROP TABLE "notification_preferences";
ALTER TABLE "new_notification_preferences" RENAME TO "notification_preferences";
CREATE UNIQUE INDEX "notification_preferences_household_id_user_id_key" ON "notification_preferences"("household_id", "user_id");

PRAGMA foreign_keys = ON;
PRAGMA defer_foreign_keys = OFF;
