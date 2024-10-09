<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "id" => $this->user->id,
            "name" => $this->user->name,
            "email" => $this->user->email,
            "is_email_verified" => $this->user->is_email_verified,
            'phone_number' => $this->phone_number,
            'profile_picture' => $this->profile_picture,
            'address' => $this->address
        ];
    }
}
