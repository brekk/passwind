# passwind

Tailwind CSS? Pass.

Other folks have [framed things well](https://www.aleksandrhovhannisyan.com/blog/why-i-dont-like-tailwind-css/), but this library is designed for folks who already have the misfortune of being opted-in to Tailwind but would like to leave it behind.

It is currently an alpha project but it aims to:

1. Provide tooling to convert tailwind utility classes into straight CSS.
2. Do the same with tooling for SCSS / CSS-in-JS environments.

# Basics

Initially we will start with a CSS file and an HTML file and write the tooling required to parse out the tailwind classes in use, and then combine them into a single declaration.
