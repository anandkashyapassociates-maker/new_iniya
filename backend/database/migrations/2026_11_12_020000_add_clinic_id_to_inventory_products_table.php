<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('inventory_products', function (Blueprint $table) {
            if (! Schema::hasColumn('inventory_products', 'clinic_id')) {
                $table->foreignId('clinic_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('clinics')
                    ->nullOnDelete();
            }
        });

        // Seed existing products to default clinic (id = 1) if available
        try {
            $defaultClinicId = DB::table('clinics')->orderBy('id', 'asc')->value('id');
            if ($defaultClinicId) {
                DB::table('inventory_products')
                    ->whereNull('clinic_id')
                    ->update(['clinic_id' => $defaultClinicId]);
            }
        } catch (\Throwable $e) {
            // Ignore if clinics table is not populated yet
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_products', function (Blueprint $table) {
            if (Schema::hasColumn('inventory_products', 'clinic_id')) {
                $table->dropForeign(['clinic_id']);
                $table->dropColumn('clinic_id');
            }
        });
    }
};
