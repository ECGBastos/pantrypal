-- CreateTable
CREATE TABLE "households" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "household_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "users_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "household_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "categories_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "shopping_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "household_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalized_name" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "quantity" TEXT,
    "unit" TEXT,
    "note" TEXT,
    "is_bought" BOOLEAN NOT NULL DEFAULT false,
    "bought_at" DATETIME,
    "created_by_user_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "shopping_items_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "shopping_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "shopping_items_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "household_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalized_name" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "quantity" REAL,
    "unit" TEXT,
    "location" TEXT NOT NULL DEFAULT '',
    "low_stock_threshold" REAL,
    "is_running_low" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "inventory_items_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "inventory_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "known_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "household_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "normalized_name" TEXT NOT NULL,
    "default_category_id" TEXT,
    "default_unit" TEXT,
    "times_added_to_shopping_list" INTEGER NOT NULL DEFAULT 0,
    "times_added_to_inventory" INTEGER NOT NULL DEFAULT 0,
    "last_used_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "known_items_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "known_items_default_category_id_fkey" FOREIGN KEY ("default_category_id") REFERENCES "categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "household_id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activity_logs_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "household_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "low_stock_reminders_enabled" BOOLEAN NOT NULL DEFAULT true,
    "weekly_shopping_reminder_enabled" BOOLEAN NOT NULL DEFAULT false,
    "unchecked_items_reminder_enabled" BOOLEAN NOT NULL DEFAULT false,
    "reminder_day" TEXT NOT NULL DEFAULT 'Saturday',
    "reminder_time" TEXT NOT NULL DEFAULT '10:00',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "notification_preferences_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "households_name_key" ON "households"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_household_id_name_key" ON "users"("household_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_household_id_name_key" ON "categories"("household_id", "name");
CREATE INDEX "categories_household_id_sort_order_idx" ON "categories"("household_id", "sort_order");

-- CreateIndex
CREATE INDEX "shopping_items_household_id_is_bought_created_at_idx" ON "shopping_items"("household_id", "is_bought", "created_at");
CREATE INDEX "shopping_items_household_id_normalized_name_idx" ON "shopping_items"("household_id", "normalized_name");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_household_id_normalized_name_location_key" ON "inventory_items"("household_id", "normalized_name", "location");
CREATE INDEX "inventory_items_household_id_location_idx" ON "inventory_items"("household_id", "location");
CREATE INDEX "inventory_items_household_id_is_running_low_idx" ON "inventory_items"("household_id", "is_running_low");

-- CreateIndex
CREATE UNIQUE INDEX "known_items_household_id_normalized_name_key" ON "known_items"("household_id", "normalized_name");
CREATE INDEX "known_items_household_id_times_added_to_shopping_list_idx" ON "known_items"("household_id", "times_added_to_shopping_list");

-- CreateIndex
CREATE INDEX "activity_logs_household_id_created_at_idx" ON "activity_logs"("household_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_household_id_user_id_key" ON "notification_preferences"("household_id", "user_id");
