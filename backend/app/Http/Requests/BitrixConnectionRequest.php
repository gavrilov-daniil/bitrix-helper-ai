<?php

namespace App\Http\Requests;

use App\Enums\BitrixAuthType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BitrixConnectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $authType = $this->input('auth_type', 'webhook');

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'domain' => ['required', 'string', 'max:255'],
            'bitrix_user_id' => ['required', 'integer', 'min:1'],
            'auth_type' => ['sometimes', 'string', Rule::enum(BitrixAuthType::class)],
        ];

        if ($authType === 'oauth') {
            $rules['client_id'] = ['required', 'string', 'max:255'];
            $rules['client_secret'] = $this->isMethod('POST')
                ? ['required', 'string']
                : ['sometimes', 'string'];
            $rules['webhook_code'] = ['sometimes', 'nullable', 'string', 'max:255'];
        } else {
            $rules['webhook_code'] = $this->isMethod('POST')
                ? ['required', 'string', 'max:255']
                : ['sometimes', 'string', 'max:255'];
            $rules['client_id'] = ['sometimes', 'nullable', 'string', 'max:255'];
            $rules['client_secret'] = ['sometimes', 'nullable', 'string'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Connection name is required.',
            'domain.required' => 'Bitrix24 domain is required.',
            'bitrix_user_id.required' => 'Bitrix24 user ID is required.',
            'bitrix_user_id.min' => 'Bitrix24 user ID must be at least 1.',
            'webhook_code.required' => 'Webhook code is required.',
            'client_id.required' => 'OAuth Client ID is required.',
            'client_secret.required' => 'OAuth Client Secret is required.',
        ];
    }
}
