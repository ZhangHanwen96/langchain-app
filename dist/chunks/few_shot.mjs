import{B as o,c as m,r as n,a as u,P as f,p as x,b as l}from"../shared/langchainjs.26ff1865.mjs";import"path";import"tty";import"util";import"fs";import"net";import"events";import"stream";import"zlib";import"buffer";import"string_decoder";import"querystring";import"url";import"http";import"crypto";import"os";import"https";import"assert";import"node:fs/promises";import"node:path";class a extends o{constructor(e){if(super(e),Object.defineProperty(this,"examples",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"exampleSelector",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"examplePrompt",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"suffix",{enumerable:!0,configurable:!0,writable:!0,value:""}),Object.defineProperty(this,"exampleSeparator",{enumerable:!0,configurable:!0,writable:!0,value:`

`}),Object.defineProperty(this,"prefix",{enumerable:!0,configurable:!0,writable:!0,value:""}),Object.defineProperty(this,"templateFormat",{enumerable:!0,configurable:!0,writable:!0,value:"f-string"}),Object.defineProperty(this,"validateTemplate",{enumerable:!0,configurable:!0,writable:!0,value:!0}),Object.assign(this,e),this.examples!==void 0&&this.exampleSelector!==void 0)throw new Error("Only one of 'examples' and 'example_selector' should be provided");if(this.examples===void 0&&this.exampleSelector===void 0)throw new Error("One of 'examples' and 'example_selector' should be provided");if(this.validateTemplate){let t=this.inputVariables;this.partialVariables&&(t=t.concat(Object.keys(this.partialVariables))),m(this.prefix+this.suffix,this.templateFormat,t)}}_getPromptType(){return"few_shot"}async getExamples(e){if(this.examples!==void 0)return this.examples;if(this.exampleSelector!==void 0)return this.exampleSelector.selectExamples(e);throw new Error("One of 'examples' and 'example_selector' should be provided")}async partial(e){const t={...this};return t.inputVariables=this.inputVariables.filter(r=>!(r in e)),t.partialVariables={...this.partialVariables??{},...e},new a(t)}async format(e){const t=await this.mergePartialAndUserVariables(e),r=await this.getExamples(t),i=await Promise.all(r.map(p=>this.examplePrompt.format(p))),s=[this.prefix,...i,this.suffix].join(this.exampleSeparator);return n(s,this.templateFormat,t)}serialize(){if(this.exampleSelector||!this.examples)throw new Error("Serializing an example selector is not currently supported");if(this.outputParser!==void 0)throw new Error("Serializing an output parser is not currently supported");return{_type:this._getPromptType(),input_variables:this.inputVariables,example_prompt:this.examplePrompt.serialize(),example_separator:this.exampleSeparator,suffix:this.suffix,prefix:this.prefix,template_format:this.templateFormat,examples:this.examples}}static async deserialize(e){const t=await u("example_prompt",e),r=await f.deserialize(t);let i;if(typeof e.examples=="string")i=await x(e.examples,".json",[".json",".yml",".yaml"]);else if(Array.isArray(e.examples))i=e.examples;else throw new Error("Invalid examples format. Only list or string are supported.");return new a({inputVariables:e.input_variables,examplePrompt:r,examples:i,exampleSeparator:e.example_separator,prefix:await l("prefix",e),suffix:await l("suffix",e),templateFormat:e.template_format})}}export{a as FewShotPromptTemplate};
