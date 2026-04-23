const s=Symbol("internals"),t=Symbol("privateInternals");function i(n){class e extends n{get[s](){return this[t]||(this[t]=this.attachInternals()),this[t]}}return e}export{s as i,i as m};
