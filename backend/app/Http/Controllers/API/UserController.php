<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\CustomerResource;
use App\Http\Resources\UserRescource;
use App\Mail\OtpMail;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum')->only(['store', 'update', 'destroy', 'profile', 'updateProfile']);
    }

    /**
     */
    public function index()
    {
        return CustomerResource::collection(Customer::all());
    }

    /**
     */
    public function register(Request $request)
    {
        $data = $request->all();

        $validation = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => [
                'required','string','min:8','confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/'
            ],
            'phone_number' => ['required'],
            'address' => ['required'],
        ]);

        if ($validation->fails()) {
            return response()->json($validation->messages(), 400);
        }

        $otp = random_int(100000, 999999); // Generate a 6-digit OTP
        $data['password'] = Hash::make($data['password']);
        $data['OTP'] = $otp;
        $user = User::create($data);
        $data['user_id'] = $user->id;
        $cust = Customer::create($data);

        Mail::to($user->email)->send(new OtpMail($otp));

        return response()->json([
            'message' => 'Registered successfully! Please check your email to verify your account.',
            'user' => new CustomerResource($cust),
            'token' => $user->createToken('auth_token')->plainTextToken,
        ], 200);
    }

    /**
     */
    public function email_verify(Request $request)
    {
        $data = $request->all();
        $validation = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp' => 'required|integer',
        ]);

        if ($validation->fails()) {
            return response()->json($validation->messages(), 400);
        }

        $user = User::where('email', $request->email)->first();
        $otp = $data['otp'];

        if ($user && $user->OTP == $otp) {
            $user->OTP = null;
            $user->is_email_verified = true;
            $user->save();
            return response()->json(['message' => 'Email verified successfully.']);
        }

        return response()->json([
            'message' => 'Invalid OTP.',
        ], 400);
    }

    /**
     */
    public function login(Request $request)
    {
        $validation = Validator::make(
            $request->all(),
            [
                'email' => 'required|email',
                'password' => 'required',
            ]
        );

        if ($validation->fails()) {
            return response()->json($validation->messages(), 400);
        }

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid Username or Password'], 400);
        }

        if ($user->role === 'customer') {
            $cust = Customer::where('user_id', $user->id)->first();
            $userdata = new CustomerResource($cust);
        } else {
            $userdata = new UserRescource($user);
        }

        return response()->json([
            'message' => 'User successfully logged in',
            'user' => $userdata,
            'token' => $user->createToken('auth_token')->plainTextToken,
        ]);
    }

    /**
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete(); 
        return response()->json(['message' => 'Logged out successfully'], 200);
    }

    /**
     */
    public function profile(Request $request)
    {
        $user = $request->user();
        $customer = Customer::where('user_id', $user->id)->first();

        if ($customer) {
            return response()->json([
                'user' => new CustomerResource($customer),
            ], 200);
        }

        return response()->json([
            'message' => 'Customer not found.',
        ], 404);
    }

    /**
     */
   public function updateProfile(Request $request)
{
    $user = $request->user();
    $customer = Customer::where('user_id', $user->id)->first();

    if (!$customer) {
        return response()->json([
            'message' => 'Customer profile not found.',
        ], 404);
    }

    $validation = Validator::make($request->all(), [
        'name' => ['sometimes', 'string', 'max:255'],
        'email' => ['sometimes', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
        'phone_number' => ['sometimes', 'string'],
        'address' => ['sometimes', 'string'],
        'password' => [
            'sometimes', 'string', 'min:8', 'confirmed',
            'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/'
        ],
        'profile_picture' => ['sometimes', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'], 
    ]);

    if ($validation->fails()) {
        return response()->json($validation->messages(), 400);
    }

    if ($request->has('name')) {
        $user->name = $request->name;
    }
    if ($request->has('email')) {
        $user->email = $request->email;
        $user->is_email_verified = false; 
    }
    if ($request->has('password')) {
        $user->password = Hash::make($request->password);
    }
    
    if ($request->hasFile('profile_picture')) {
        if ($user->profile_image) {
            \Storage::delete($user->profile_image);
        }

        $path = $request->file('profile_picture')->store('images', 'public');
        $user->profile_image = $path;
    }

    $user->save();

    if ($request->has('phone_number')) {
        $customer->phone_number = $request->phone_number;
    }
    if ($request->has('address')) {
        $customer->address = $request->address;
    }
    $customer->save();

    return response()->json([
        'message' => 'Profile updated successfully.',
        'user' => new CustomerResource($customer),
        'profile_image_url' => $user->profile_image ? url('storage/' . $user->profile_image) : null, // إرجاع رابط الصورة
    ], 200);
}

    /**
     */
    public function show(User $user)
    {
        return new UserResource($user);
    }

    /**
     */
    public function update(Request $request, User $user)
    {
        //
    }

    /**
     */
    public function destroy(User $user)
    {
        //
    }
}
