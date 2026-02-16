<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\AiProvider;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AiConnectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'provider' => ['required', 'string', Rule::enum(AiProvider::class)],
            'api_key' => $this->isMethod('POST')
                ? ['required', 'string']
                : ['sometimes', 'string'],
            'model' => ['required', 'string', 'max:255'],
            'priority' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Connection name is required.',
            'provider.required' => 'AI provider is required.',
            'api_key.required' => 'API key is required.',
            'model.required' => 'Model name is required.',
        ];
    }
}
