<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bitrix_connections', function (Blueprint $table) {
            $table->string('auth_type')->default('webhook')->after('webhook_code');
            $table->string('client_id')->nullable()->after('auth_type');
            $table->text('client_secret')->nullable()->after('client_id');
            $table->text('access_token')->nullable()->after('client_secret');
            $table->text('refresh_token')->nullable()->after('access_token');
            $table->timestamp('token_expires_at')->nullable()->after('refresh_token');
        });
    }

    public function down(): void
    {
        Schema::table('bitrix_connections', function (Blueprint $table) {
            $table->dropColumn([
                'auth_type',
                'client_id',
                'client_secret',
                'access_token',
                'refresh_token',
                'token_expires_at',
            ]);
        });
    }
};
