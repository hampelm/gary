A static site for the garydata project. Built on Jekyll  with
site management in [prose](http://prose.io). To get started, clone this repo and [install Jekyll](http://jekyllrb.com/docs/installation).

To work on the site locally, run `jekyll serve --watch`, then visit `http://localhost:4000` in your browser.

Edit files in the root directory. The generated site will appear in `_site/`.


## Images

Upload the image to the `img` directory

Then, link it to your page. You might have to add a `width="100%"` property to keep the size looking right

```
<img src="{{site.baseurl}}/img/gary_stats.jpg" alt="">
```