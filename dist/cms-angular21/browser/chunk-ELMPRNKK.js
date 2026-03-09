function t(c,n){let o=URL.createObjectURL(c),e=document.createElement("a");e.href=o,e.download=n,document.body.appendChild(e),e.click(),e.remove(),URL.revokeObjectURL(o)}export{t as a};
