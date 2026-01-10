<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
            'required',
            'string',
            'lowercase',
            'email',
            'max:255',
            Rule::unique(User::class)->ignore($this->user()->id),
        ],
            'bio' => ['nullable', 'string', 'max:500'],
            'instagram' => ['nullable', 'string', 'max:225'],
            'tiktok' => ['nullable', 'string', 'max:225'],
            'linkedin' => ['nullable', 'string', 'max:225'],
            'twitter' => ['nullable', 'string', 'max:225'],
            'website' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:225'],
            'gender' => ['nullable', 'string', 'max:50'],
        ];
    }
}
