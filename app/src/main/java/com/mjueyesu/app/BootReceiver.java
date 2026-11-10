package com.mjueyesu.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Simu ikiwashwa upya, panga tena kikumbusho. */
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        DailyReminder.schedule(context);
    }
}
