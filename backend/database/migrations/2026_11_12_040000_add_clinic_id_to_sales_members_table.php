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
        Schema::table('sales_members', function (Blueprint $table) {
            if (! Schema::hasColumn('sales_members', 'clinic_id')) {
                $table->foreignId('clinic_id')
                    ->nullable()
                    ->after('sales_code')
                    ->constrained('clinics')
                    ->nullOnDelete();
            }
        });

        // Seed existing sales members to first available clinic if any exists
        try {
            $defaultClinicId = DB::table('clinics')->orderBy('id', 'asc')->value('id');
            if ($defaultClinicId) {
                DB::table('sales_members')
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
        Schema::table('sales_members', function (Blueprint $table) {
            if (Schema::hasColumn('sales_members', 'clinic_id')) {
                $table->dropForeign(['clinic_id']);
                $table->dropColumn('clinic_id');
            }
        });
    }
};

