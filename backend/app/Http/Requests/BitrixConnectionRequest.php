<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BitrixConnectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'domain' => ['required', 'string', 'max:255'],
            'bitrix_user_id' => ['required', 'integer', 'min:1'],
            'webhook_code' => $this->isMethod('POST')
                ? ['required', 'string', 'max:255']
                : ['sometimes', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Connection name is required.',
            'domain.required' => 'Bitrix24 domain is required.',
            'bitrix_user_id.required' => 'Bitrix24 user ID is required.',
            'bitrix_user_id.min' => 'Bitrix24 user ID must be at least 1.',
            'webhook_code.required' => 'Webhook code is required.',
        ];
    }
}
