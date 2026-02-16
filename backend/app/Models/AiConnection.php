<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AiProvider;
use App\Enums\ConnectionStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiConnection extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'provider',
        'api_key',
        'model',
        'priority',
        'is_active',
        'last_status',
        'error_message',
        'last_checked_at',
    ];

    protected $hidden = [
        'api_key',
    ];

    protected function casts(): array
    {
        return [
            'provider' => AiProvider::class,
            'last_status' => ConnectionStatus::class,
            'api_key' => 'encrypted',
            'is_active' => 'boolean',
            'priority' => 'integer',
            'last_checked_at' => 'datetime',
        ];
    }
}
