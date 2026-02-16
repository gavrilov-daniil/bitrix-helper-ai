<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bitrix_connections', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('domain');
            $table->unsignedInteger('bitrix_user_id');
            $table->text('webhook_code');
            $table->boolean('is_active')->default(true);
            $table->string('last_status')->default('disconnected');
            $table->timestamp('last_checked_at')->nullable();
            $table->json('available_scopes')->nullable();
            $table->string('server_time')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bitrix_connections');
    }
};
