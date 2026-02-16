<?php

namespace App\Models;

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
        'is_active',
    ];

    protected $hidden = [
        'webhook_code',
    ];

    protected function casts(): array
    {
        return [
            'last_status' => ConnectionStatus::class,
            'webhook_code' => 'encrypted',
            'is_active' => 'boolean',
            'available_scopes' => 'array',
            'last_checked_at' => 'datetime',
        ];
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
