package com.mjueyesu.app;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import androidx.core.app.NotificationCompat;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

/** Kikumbusho cha kila siku cha kukariri fungu la juma (arifa). */
public class DailyReminder {
    static final String PREFS = "mjue_reminder";
    static final String CHANNEL = "mjue_verse";
    static final int REQ = 7001;

    /** Hifadhi mipangilio na upange arifa ijayo (au ighairi ikiwa imezimwa). */
    static void apply(Context c, boolean on, int hour, int minute, String payloadJson) {
        SharedPreferences sp = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        SharedPreferences.Editor ed = sp.edit().putBoolean("on", on).putInt("h", hour).putInt("m", minute);
        if (payloadJson != null && payloadJson.length() > 2) ed.putString("payload", payloadJson);
        ed.apply();
        if (on) schedule(c); else cancel(c);
    }

    static PendingIntent pi(Context c) {
        Intent i = new Intent(c, ReminderReceiver.class);
        i.setAction("com.mjueyesu.app.DAILY_VERSE");
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= 23) flags |= PendingIntent.FLAG_IMMUTABLE;
        return PendingIntent.getBroadcast(c, REQ, i, flags);
    }

    /** Panga arifa ya mara moja kwa saa iliyochaguliwa (kesho ikiwa saa ya leo imepita). Mpokeaji hujipanga upya kila siku. */
    static void schedule(Context c) {
        SharedPreferences sp = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        if (!sp.getBoolean("on", false)) return;
        Calendar t = Calendar.getInstance();
        t.set(Calendar.HOUR_OF_DAY, sp.getInt("h", 6));
        t.set(Calendar.MINUTE, sp.getInt("m", 0));
        t.set(Calendar.SECOND, 0);
        t.set(Calendar.MILLISECOND, 0);
        if (t.getTimeInMillis() <= System.currentTimeMillis() + 15000) t.add(Calendar.DAY_OF_YEAR, 1);
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        PendingIntent p = pi(c);
        if (Build.VERSION.SDK_INT >= 23) am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t.getTimeInMillis(), p);
        else am.set(AlarmManager.RTC_WAKEUP, t.getTimeInMillis(), p);
    }

    static void cancel(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am != null) am.cancel(pi(c));
    }

    /** Onyesha arifa ya fungu la leo. */
    static void notifyToday(Context c) {
        String title = "📖 Fungu la kukariri";
        String body = "Rudia fungu la kukariri la juma hili.";
        try {
            String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
            JSONArray a = new JSONArray(c.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString("payload", "[]"));
            for (int i = 0; i < a.length(); i++) {
                JSONObject o = a.getJSONObject(i);
                // tarehe za ISO (yyyy-MM-dd) zinalinganishwa kama maandishi
                if (today.compareTo(o.getString("s")) >= 0 && today.compareTo(o.getString("e")) <= 0) {
                    title = "📖 Fungu la kukariri · Juma " + o.getInt("n");
                    body = o.getString("r") + " — “" + o.getString("t") + "”";
                    break;
                }
            }
        } catch (Exception ignored) { }

        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel ch = new NotificationChannel(CHANNEL, "Kikumbusho cha fungu la kukariri", NotificationManager.IMPORTANCE_DEFAULT);
            nm.createNotificationChannel(ch);
        }
        Intent open = new Intent(c, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= 23) flags |= PendingIntent.FLAG_IMMUTABLE;
        PendingIntent tap = PendingIntent.getActivity(c, REQ + 1, open, flags);
        NotificationCompat.Builder b = new NotificationCompat.Builder(c, CHANNEL)
                .setSmallIcon(c.getApplicationInfo().icon)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                .setAutoCancel(true)
                .setContentIntent(tap)
                .setPriority(NotificationCompat.PRIORITY_DEFAULT);
        try { nm.notify(REQ, b.build()); } catch (SecurityException ignored) { }
    }
}
