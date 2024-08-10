const config = {
    onwarn: (warning, handler) => {
        console.log("🚀 ~ file: svelte.config.js:3 ~ warning:", warning);

        if (warning.code.toLowerCase().startsWith("a11y-")) {
            return;
        }
        handler(warning);
    }
};
