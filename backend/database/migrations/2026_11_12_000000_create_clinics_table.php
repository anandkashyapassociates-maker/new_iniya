<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('clinics', function (Blueprint $table) {
            $table->id();
            $table->string('clinic_code', 30)->unique()->index();
            $table->string('name', 150)->index();
            $table->string('branch_name', 120)->nullable();
            $table->string('location', 150);
            $table->text('address');
            $table->string('city', 100)->nullable()->index();
            $table->string('state', 100)->nullable();
            $table->string('postal_code', 20)->nullable();
            $table->string('country', 100)->default('India');
            $table->string('phone', 30);
            $table->string('alternate_phone', 30)->nullable();
            $table->string('email', 150)->nullable()->index();
            $table->string('contact_person', 150)->nullable();
            $table->enum('status', ['active', 'inactive', 'maintenance'])->default('active')->index();
            $table->text('notes')->nullable();
            $table->foreignId('created_by_superadmin_id')->nullable()->constrained('super_admins')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clinics');
    }
};

