<?php

namespace App\Models;

use App\Enums\BitrixAuthType;
use App\Enums\ConnectionStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BitrixConnection extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'domain',
        'bitrix_user_id',
        'webhook_code',
        'auth_type',
        'client_id',
        'client_secret',
        'access_token',
        'refresh_token',
        'token_expires_at',
        'is_active',
        'last_status',
        'last_checked_at',
        'server_time',
        'available_scopes',
        'error_message',
    ];

    protected $hidden = [
        'webhook_code',
        'client_secret',
        'access_token',
        'refresh_token',
    ];

    protected function casts(): array
    {
        return [
            'auth_type' => BitrixAuthType::class,
            'last_status' => ConnectionStatus::class,
            'webhook_code' => 'encrypted',
            'client_secret' => 'encrypted',
            'access_token' => 'encrypted',
            'refresh_token' => 'encrypted',
            'is_active' => 'boolean',
            'available_scopes' => 'array',
            'last_checked_at' => 'datetime',
            'token_expires_at' => 'datetime',
        ];
    }

    public function isOAuth(): bool
    {
        return $this->auth_type === BitrixAuthType::OAuth;
    }

    public function isWebhook(): bool
    {
        return $this->auth_type === BitrixAuthType::Webhook;
    }

    public function getWebhookUrlAttribute(): string
    {
        $domain = rtrim($this->domain, '/');
        if (!str_starts_with($domain, 'http')) {
            $domain = 'https://' . $domain;
        }

        return "{$domain}/rest/{$this->bitrix_user_id}/{$this->webhook_code}/";
    }
}
