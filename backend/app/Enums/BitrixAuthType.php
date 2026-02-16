<?php

declare(strict_types=1);

namespace App\Enums;

enum BitrixAuthType: string
{
    case Webhook = 'webhook';
    case OAuth = 'oauth';
}
