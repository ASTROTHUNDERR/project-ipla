const r = [...Array(31)].map((_, i) => {
    return {
        value: String(i + 1),
        content: String(i + 1)
    };
});

console.log(r)