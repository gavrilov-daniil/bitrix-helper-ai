<?php

declare(strict_types=1);

namespace App\Services\Ai;

use App\Models\AiConnection;

interface AiServiceInterface
{
    public function chat(AiConnection $connection, array $messages): string;

    public function testConnection(AiConnection $connection): array;
}
