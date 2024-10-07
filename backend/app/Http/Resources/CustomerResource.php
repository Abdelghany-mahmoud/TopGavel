<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'name' => $this->user->name, 
            'email' => $this->user->email,
            'phone_number' => $this->phone_number,
            'profile_picture' => $this->profile_picture,
            'address' => $this->address,
            'is_email_verified' => $this->user->is_email_verified,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
