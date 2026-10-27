using System;
using System.IO;
using System.Windows.Forms;
using Microsoft.Web.WebView2.WinForms;
using Microsoft.Web.WebView2.Core;

namespace CyberDrop;

static class Program
{
    [STAThread]
    static void Main()
    {
        ApplicationConfiguration.Initialize();
        var form = new Form
        {
            Text = "CyberDrop - Zero-Internet Cross-Platform File Share",
            Width = 1240,
            Height = 840,
            StartPosition = FormStartPosition.CenterScreen,
            BackColor = System.Drawing.Color.FromArgb(7, 11, 18)
        };

        var webView = new WebView2 { Dock = DockStyle.Fill };
        form.Controls.Add(webView);

        form.Load += async (sender, e) =>
        {
            try
            {
                var env = await CoreWebView2Environment.CreateAsync(null, Path.Combine(Path.GetTempPath(), "CyberDrop_UserData"));
                await webView.EnsureCoreWebView2Async(env);

                string appDir = AppDomain.CurrentDomain.BaseDirectory;
                string distDir = Path.Combine(appDir, "dist");
                if (!Directory.Exists(distDir)) distDir = appDir;

                webView.CoreWebView2.SetVirtualHostNameToFolderMapping("app.local", distDir, CoreWebView2HostResourceAccessKind.Allow);
                webView.CoreWebView2.Navigate("https://app.local/index.html");
            }
            catch (Exception ex)
            {
                MessageBox.Show("CyberDrop Launcher Notice: " + ex.Message);
            }
        };

        Application.Run(form);
    }
}
