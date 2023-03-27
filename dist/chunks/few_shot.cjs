"use strict";const app=require("../shared/langchainjs.c59c8ae0.cjs");require("path"),require("tty"),require("util"),require("fs"),require("net"),require("events"),require("stream"),require("zlib"),require("buffer"),require("string_decoder"),require("querystring"),require("url"),require("http"),require("crypto"),require("os"),require("https"),require("assert"),require("node:fs/promises"),require("node:path"),require("child_process");class FewShotPromptTemplate extends app.BaseStringPromptTemplate{constructor(e){if(super(e),Object.defineProperty(this,"examples",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"exampleSelector",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"examplePrompt",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"suffix",{enumerable:!0,configurable:!0,writable:!0,value:""}),Object.defineProperty(this,"exampleSeparator",{enumerable:!0,configurable:!0,writable:!0,value:`

`}),Object.defineProperty(this,"prefix",{enumerable:!0,configurable:!0,writable:!0,value:""}),Object.defineProperty(this,"templateFormat",{enumerable:!0,configurable:!0,writable:!0,value:"f-string"}),Object.defineProperty(this,"validateTemplate",{enumerable:!0,configurable:!0,writable:!0,value:!0}),Object.assign(this,e),this.examples!==void 0&&this.exampleSelector!==void 0)throw new Error("Only one of 'examples' and 'example_selector' should be provided");if(this.examples===void 0&&this.exampleSelector===void 0)throw new Error("One of 'examples' and 'example_selector' should be provided");if(this.validateTemplate){let r=this.inputVariables;this.partialVariables&&(r=r.concat(Object.keys(this.partialVariables))),app.checkValidTemplate(this.prefix+this.suffix,this.templateFormat,r)}}_getPromptType(){return"few_shot"}async getExamples(e){if(this.examples!==void 0)return this.examples;if(this.exampleSelector!==void 0)return this.exampleSelector.selectExamples(e);throw new Error("One of 'examples' and 'example_selector' should be provided")}async partial(e){const r={...this};return r.inputVariables=this.inputVariables.filter(t=>!(t in e)),r.partialVariables={...this.partialVariables??{},...e},new FewShotPromptTemplate(r)}async format(e){const r=await this.mergePartialAndUserVariables(e),t=await this.getExamples(r),i=await Promise.all(t.map(s=>this.examplePrompt.format(s))),a=[this.prefix,...i,this.suffix].join(this.exampleSeparator);return app.renderTemplate(a,this.templateFormat,r)}serialize(){if(this.exampleSelector||!this.examples)throw new Error("Serializing an example selector is not currently supported");if(this.outputParser!==void 0)throw new Error("Serializing an output parser is not currently supported");return{_type:this._getPromptType(),input_variables:this.inputVariables,example_prompt:this.examplePrompt.serialize(),example_separator:this.exampleSeparator,suffix:this.suffix,prefix:this.prefix,template_format:this.templateFormat,examples:this.examples}}static async deserialize(e){const r=await app.resolveConfigFromFile("example_prompt",e),t=await app.PromptTemplate.deserialize(r);let i;if(typeof e.examples=="string")i=await app.parseFileConfig(e.examples,".json",[".json",".yml",".yaml"]);else if(Array.isArray(e.examples))i=e.examples;else throw new Error("Invalid examples format. Only list or string are supported.");return new FewShotPromptTemplate({inputVariables:e.input_variables,examplePrompt:t,examples:i,exampleSeparator:e.example_separator,prefix:await app.resolveTemplateFromFile("prefix",e),suffix:await app.resolveTemplateFromFile("suffix",e),templateFormat:e.template_format})}}exports.FewShotPromptTemplate=FewShotPromptTemplate;
