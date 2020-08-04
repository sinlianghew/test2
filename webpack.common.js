const path =                            require("path")
const fs =                              require("fs")
const HtmlWebpackPlugin =               require("html-webpack-plugin")
const MiniCssExtractPlugin =            require("mini-css-extract-plugin")
const CssUrlRelativePlugin =            require("css-url-relative-plugin")
const webpack =                         require("webpack");
const CopyPlugin =                      require("copy-webpack-plugin");
const MomentLocalesPlugin =             require('moment-locales-webpack-plugin');

const pages = fs.readdirSync(path.resolve(__dirname, "src"))
    .filter(fileName => fileName.endsWith(".twig"))

module.exports = {
    entry: "./src/js/index.js",
    resolve: {
        extensions: [".js", ".scss", ".css"],
        alias: {
            '@': path.resolve(__dirname, 'src'),
            assets: path.resolve(__dirname, 'src/spa-assets'),
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    plugins: [
        ...pages.map(page => new HtmlWebpackPlugin({
            template: "src/" + page,
            filename: page.replace(".twig", ".html"),
            inject: true
        })),
        new MiniCssExtractPlugin({
            filename: "/css/[name].css"
        }),
        new CssUrlRelativePlugin(),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: 'jquery',
            "window.jQuery": "jquery",
            Popper: ['popper.js', 'default'],
            Alert: "exports-loader?Alert!bootstrap/js/dist/alert",
            Button: "exports-loader?Button!bootstrap/js/dist/button",
            Carousel: "exports-loader?Carousel!bootstrap/js/dist/carousel",
            Collapse: "exports-loader?Collapse!bootstrap/js/dist/collapse",
            Dropdown: "exports-loader?Dropdown!bootstrap/js/dist/dropdown",
            Modal: "exports-loader?Modal!bootstrap/js/dist/modal",
            Popover: "exports-loader?Popover!bootstrap/js/dist/popover",
            Scrollspy: "exports-loader?Scrollspy!bootstrap/js/dist/scrollspy",
            Tab: "exports-loader?Tab!bootstrap/js/dist/tab",
            Tooltip: "exports-loader?Tooltip!bootstrap/js/dist/tooltip",
            Util: "exports-loader?Util!bootstrap/js/dist/util",
        }),
        new MomentLocalesPlugin() // remove the non related locales
    ]
}