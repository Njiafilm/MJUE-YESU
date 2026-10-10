package com.mjueyesu.app;

import android.annotation.SuppressLint;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Iterator;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.FileProvider;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private static final int REQ_FILE = 4711;
    private ValueCallback<Uri[]> fileCallback;

    /**
     * Daraja la mtandao kwa ajili ya Cloud (Firebase). Hupitia Java ili kuepuka vikwazo vya CORS
     * kwenye file:// na kuruhusu tu seva za Firebase/Google zilizoorodheshwa.
     */
    private class NativeNet {
        @JavascriptInterface
        public void request(final int id, final String method, final String url,
                            final String headersJson, final String body) {
            new Thread(new Runnable() {
                @Override
                public void run() {
                    int status = 0;
                    String resp = "";
                    try {
                        Uri u = Uri.parse(url);
                        String host = u.getHost();
                        if (!"https".equals(u.getScheme()) || host == null
                                || !(host.equals("firestore.googleapis.com")
                                || host.equals("identitytoolkit.googleapis.com")
                                || host.equals("securetoken.googleapis.com"))) {
                            throw new java.io.IOException("blocked host");
                        }
                        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
                        c.setConnectTimeout(20000);
                        c.setReadTimeout(60000);
                        c.setRequestMethod("GET".equals(method) ? "GET" : "POST");
                        JSONObject h = new JSONObject(headersJson == null || headersJson.isEmpty() ? "{}" : headersJson);
                        Iterator<String> it = h.keys();
                        while (it.hasNext()) {
                            String k = it.next();
                            c.setRequestProperty(k, h.getString(k));
                        }
                        if (!"GET".equals(method) && body != null) {
                            byte[] data = body.getBytes("UTF-8");
                            c.setDoOutput(true);
                            c.setFixedLengthStreamingMode(data.length);
                            OutputStream os = c.getOutputStream();
                            os.write(data);
                            os.close();
                        }
                        status = c.getResponseCode();
                        InputStream in = status >= 400 ? c.getErrorStream() : c.getInputStream();
                        if (in != null) {
                            ByteArrayOutputStream bo = new ByteArrayOutputStream();
                            byte[] buf = new byte[16384];
                            int n;
                            while ((n = in.read(buf)) > 0) bo.write(buf, 0, n);
                            in.close();
                            resp = bo.toString("UTF-8");
                        }
                        c.disconnect();
                    } catch (Exception e) {
                        status = 0;
                        resp = "";
                    }
                    final String js = "window.__mjueNetCb&&window.__mjueNetCb(" + id + "," + status + ","
                            + JSONObject.quote(resp).replace("\u2028", "\\u2028").replace("\u2029", "\\u2029") + ")";
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            if (webView != null) webView.evaluateJavascript(js, null);
                        }
                    });
                }
            }).start();
        }

        /** Fungua PDF (base64 au data URL) kwa programu ya kusoma PDF ya simu. */
        @JavascriptInterface
        public void openPdf(final String b64, final String name) {
            new Thread(new Runnable() {
                @Override
                public void run() {
                    try {
                        String clean = b64 == null ? "" : b64;
                        int comma = clean.indexOf(',');
                        if (clean.startsWith("data:") && comma >= 0) clean = clean.substring(comma + 1);
                        byte[] bytes = android.util.Base64.decode(clean, android.util.Base64.DEFAULT);
                        java.io.File dir = new java.io.File(getCacheDir(), "pdfs");
                        dir.mkdirs();
                        String safe = (name == null || name.length() == 0 ? "file" : name).replaceAll("[^A-Za-z0-9._-]", "_");
                        if (!safe.toLowerCase().endsWith(".pdf")) safe = safe + ".pdf";
                        java.io.File f = new java.io.File(dir, safe);
                        java.io.FileOutputStream fo = new java.io.FileOutputStream(f);
                        fo.write(bytes);
                        fo.close();
                        final Uri uri = FileProvider.getUriForFile(MainActivity.this, getPackageName() + ".fileprovider", f);
                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                try {
                                    Intent i = new Intent(Intent.ACTION_VIEW);
                                    i.setDataAndType(uri, "application/pdf");
                                    i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                                    startActivity(i);
                                } catch (Exception e) {
                                    Toast.makeText(MainActivity.this, "Hakuna programu ya kusoma PDF kwenye simu hii", Toast.LENGTH_LONG).show();
                                }
                            }
                        });
                    } catch (Exception e) {
                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                Toast.makeText(MainActivity.this, "Imeshindwa kufungua PDF", Toast.LENGTH_LONG).show();
                            }
                        });
                    }
                }
            }).start();
        }

        /** Nakili maandishi kwenye clipboard ya simu. */
        @JavascriptInterface
        public void copy(final String text) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                        cm.setPrimaryClip(ClipData.newPlainText("MJUE YESU", text == null ? "" : text));
                        Toast.makeText(MainActivity.this, "Imenakiliwa", Toast.LENGTH_SHORT).show();
                    } catch (Exception ignored) {}
                }
            });
        }

        /** Shiriki maandishi/kiungo kupitia programu nyingine. */
        @JavascriptInterface
        public void share(final String title, final String text, final String url) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        Intent i = new Intent(Intent.ACTION_SEND);
                        i.setType("text/plain");
                        if (title != null) i.putExtra(Intent.EXTRA_SUBJECT, title);
                        String body = (text == null ? "" : text) + ((url != null && url.length() > 0) ? "\n" + url : "");
                        i.putExtra(Intent.EXTRA_TEXT, body);
                        startActivity(Intent.createChooser(i, "Shiriki"));
                    } catch (Exception ignored) {}
                }
            });
        }

        /** Fungua kiungo cha http(s) kwenye kivinjari cha simu. */
        @JavascriptInterface
        public void openUrl(final String url) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        if (url == null || !(url.startsWith("http://") || url.startsWith("https://"))) return;
                        startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                    } catch (Exception ignored) {}
                }
            });
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
        getWindow().setStatusBarColor(Color.parseColor("#6B2D9B"));
        WindowInsetsControllerCompat insets =
                WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if (insets != null) {
            insets.setAppearanceLightStatusBars(false);
        }

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#f3eef8"));
        webView = new WebView(this);
        root.addView(webView, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT));
        setContentView(root);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        // Faster rendering
        s.setRenderPriority(WebSettings.RenderPriority.HIGH);
        try {
            webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        } catch (Exception ignored) {}

        webView.setBackgroundColor(Color.parseColor("#f3eef8"));
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) {
                    fileCallback.onReceiveValue(null);
                    fileCallback = null;
                }
                fileCallback = callback;
                Intent intent;
                try {
                    intent = params.createIntent();
                } catch (Exception e) {
                    intent = new Intent(Intent.ACTION_GET_CONTENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    intent.setType("*/*");
                }
                try {
                    startActivityForResult(intent, REQ_FILE);
                } catch (Exception e) {
                    fileCallback = null;
                    callback.onReceiveValue(null);
                    Toast.makeText(MainActivity.this, "Haiwezi kufungua kichagua faili", Toast.LENGTH_LONG).show();
                    return false;
                }
                return true;
            }
        });
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                // Keep offline assets inside WebView
                if (url.startsWith("file:") || url.startsWith("data:") || url.startsWith("blob:")) {
                    return false;
                }
                // Optional: open http(s) still inside for offline-first app
                return false;
            }
        });

        webView.addJavascriptInterface(new NativeNet(), "MJUE_NATIVE");
        webView.loadUrl("file:///android_asset/www/index.html");
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == REQ_FILE) {
            if (fileCallback != null) {
                Uri[] result = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
                fileCallback.onReceiveValue(result);
                fileCallback = null;
            }
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onBackPressed() {
        if (webView == null) {
            super.onBackPressed();
            return;
        }
        // Funga tabaka la juu kwanza (dirisha la fungu / Biblia / lesoni), kisha rudi nyuma
        webView.evaluateJavascript(
                "(function(){return !!(window.mjueBack&&window.mjueBack());})()",
                new android.webkit.ValueCallback<String>() {
                    @Override
                    public void onReceiveValue(String value) {
                        if ("true".equals(value)) return;
                        if (webView != null && webView.canGoBack()) {
                            webView.goBack();
                        } else {
                            MainActivity.super.onBackPressed();
                        }
                    }
                });
    }

    @Override
    protected void onDestroy() {
        if (fileCallback != null) {
            fileCallback.onReceiveValue(null);
            fileCallback = null;
        }
        if (webView != null) {
            webView.loadUrl("about:blank");
            webView.stopLoading();
            webView.setWebChromeClient(null);
            webView.setWebViewClient(null);
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
