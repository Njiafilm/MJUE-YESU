package com.mjueyesu.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Hupokea alamu ya kila siku, huonyesha arifa na kupanga ya kesho. */
public class ReminderReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        DailyReminder.notifyToday(context);
        DailyReminder.schedule(context);
    }
}
