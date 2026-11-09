<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function showLogin()
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }
        return view('auth.login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required',
            'password' => 'required',
        ]);

        $user = User::where('email', $credentials['email'])
            ->orWhere('badge_number', $credentials['email'])
            ->first();

        if ($user && Hash::check($credentials['password'], $user->password)) {
            Auth::login($user, $request->boolean('remember'));
            $request->session()->regenerate();
            return redirect()->intended(route('dashboard'));
        }

        // Demo fallback check
        if (
            ($credentials['email'] === 'imo.commander@police.gov.ng' || $credentials['email'] === 'NPF-IMO-001')
            && $credentials['password'] === 'IMO-POLICE-911'
        ) {
            $user = User::firstOrCreate(
                ['email' => 'imo.commander@police.gov.ng'],
                [
                    'name' => 'CP Imo State Command',
                    'password' => Hash::make('IMO-POLICE-911'),
                    'badge_number' => 'NPF-IMO-001',
                    'role' => 'Commissioner of Police / Fleet Command',
                    'department' => 'Nigeria Police Force — Imo State Command',
                ]
            );
            Auth::login($user, true);
            $request->session()->regenerate();
            return redirect()->intended(route('dashboard'));
        }

        return back()->withErrors([
            'email' => 'Invalid Service ID, Command Email, or Passcode.',
        ])->withInput($request->only('email'));
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('login');
    }
}

