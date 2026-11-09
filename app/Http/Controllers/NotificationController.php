<?php

namespace App\Http\Controllers;

use App\Models\FleetNotification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $query = FleetNotification::query();

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        $notifications = $query->orderBy('created_at', 'desc')->get();
        $unreadCount = FleetNotification::where('is_read', false)->count();

        return view('notifications.index', compact('notifications', 'unreadCount'));
    }

    public function markAsRead($id)
    {
        $notif = FleetNotification::findOrFail($id);
        $notif->is_read = true;
        $notif->save();
        return back()->with('success', 'Notification marked as read.');
    }

    public function markAllAsRead()
    {
        FleetNotification::where('is_read', false)->update(['is_read' => true]);
        return back()->with('success', 'All notifications marked as read.');
    }

    public function destroy($id)
    {
        $notif = FleetNotification::findOrFail($id);
        $notif->delete();
        return back()->with('success', 'Notification deleted.');
    }

    public function generateTest()
    {
        FleetNotification::create([
            'id' => 'NOTIF-' . rand(110, 999),
            'title' => 'Test Emergency Priority Alert',
            'message' => 'Simulated 10-33 Officer in Distress distress beacon triggered on sector 4.',
            'type' => 'alert',
            'timestamp' => now()->format('Y-m-d H:i'),
            'is_read' => false,
        ]);

        return back()->with('success', 'Test alert broadcast to fleet terminal.');
    }
}

