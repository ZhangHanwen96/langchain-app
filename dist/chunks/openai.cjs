"use strict";const app=require("../shared/langchainjs.756df653.cjs");require("path"),require("tty"),require("util"),require("fs"),require("net"),require("events"),require("stream"),require("zlib"),require("buffer"),require("string_decoder"),require("querystring"),require("url"),require("http"),require("crypto"),require("os"),require("https"),require("assert"),require("node:fs/promises"),require("node:path");function messageTypeToOpenAIRole(i){switch(i){case"system":return"system";case"ai":return"assistant";case"human":return"user";default:throw new Error(`Unknown message type: ${i}`)}}function openAIResponseToChatMessage(i,e){switch(i){case"user":return new app.HumanChatMessage(e);case"assistant":return new app.AIChatMessage(e);case"system":return new app.SystemChatMessage(e);default:return new app.ChatMessage(e,i??"unknown")}}class ChatOpenAI extends app.BaseChatModel{constructor(e,r){if(super(e??{}),Object.defineProperty(this,"temperature",{enumerable:!0,configurable:!0,writable:!0,value:1}),Object.defineProperty(this,"topP",{enumerable:!0,configurable:!0,writable:!0,value:1}),Object.defineProperty(this,"frequencyPenalty",{enumerable:!0,configurable:!0,writable:!0,value:0}),Object.defineProperty(this,"presencePenalty",{enumerable:!0,configurable:!0,writable:!0,value:0}),Object.defineProperty(this,"n",{enumerable:!0,configurable:!0,writable:!0,value:1}),Object.defineProperty(this,"logitBias",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"modelName",{enumerable:!0,configurable:!0,writable:!0,value:"gpt-3.5-turbo"}),Object.defineProperty(this,"modelKwargs",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"stop",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"streaming",{enumerable:!0,configurable:!0,writable:!0,value:!1}),Object.defineProperty(this,"maxTokens",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"batchClient",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"streamingClient",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"clientConfig",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),!(e?.openAIApiKey??process.env.OPENAI_API_KEY))throw new Error("OpenAI API key not found");if(this.modelName=e?.modelName??this.modelName,this.modelKwargs=e?.modelKwargs??{},this.temperature=e?.temperature??this.temperature,this.topP=e?.topP??this.topP,this.frequencyPenalty=e?.frequencyPenalty??this.frequencyPenalty,this.presencePenalty=e?.presencePenalty??this.presencePenalty,this.maxTokens=e?.maxTokens,this.n=e?.n??this.n,this.logitBias=e?.logitBias,this.stop=e?.stop,this.streaming=e?.streaming??!1,this.streaming&&this.n>1)throw new Error("Cannot stream results when n > 1");this.clientConfig={apiKey:e?.openAIApiKey??process.env.OPENAI_API_KEY,...r}}invocationParams(){return{model:this.modelName,temperature:this.temperature,top_p:this.topP,frequency_penalty:this.frequencyPenalty,presence_penalty:this.presencePenalty,max_tokens:this.maxTokens,n:this.n,logit_bias:this.logitBias,stop:this.stop,stream:this.streaming,...this.modelKwargs}}_identifyingParams(){return{model_name:this.modelName,...this.invocationParams(),...this.clientConfig}}identifyingParams(){return this._identifyingParams()}async _generate(e,r){const t={};if(this.stop&&r)throw new Error("Stop found in input and default params");const a=this.invocationParams();a.stop=r??a.stop;const{data:p}=await this.completionWithRetry({...a,messages:e.map(n=>({role:messageTypeToOpenAIRole(n._getType()),content:n.text}))});if(a.stream){let n="assistant";const o=await new Promise((u,d)=>{let b="";const y=app.createParser(s=>{if(s.type==="event")if(s.data==="[DONE]")u(b);else{const l=JSON.parse(s.data).choices[0];l!=null&&(b+=l.delta?.content??"",n=l.delta?.role??n,this.callbackManager.handleLLMNewToken(l.delta?.content??"",!0))}}),f=p;f.on("data",s=>y.feed(s.toString("utf-8"))),f.on("error",s=>d(s))});return{generations:[{text:o,message:openAIResponseToChatMessage(n,o)}]}}const{completion_tokens:c,prompt_tokens:m,total_tokens:h}=p.usage??{};c&&(t.completionTokens=(t.completionTokens??0)+c),m&&(t.promptTokens=(t.promptTokens??0)+m),h&&(t.totalTokens=(t.totalTokens??0)+h);const g=[];for(const n of p.choices){const o=n.message?.role??void 0,u=n.message?.content??"";g.push({text:u,message:openAIResponseToChatMessage(o,u)})}return{generations:g,llmOutput:{tokenUsage:t}}}async completionWithRetry(e){if(!e.stream&&!this.batchClient){const t=new app.dist.Configuration({...this.clientConfig,baseOptions:{adapter:app.fetchAdapter}});this.batchClient=new app.dist.OpenAIApi(t)}if(e.stream&&!this.streamingClient){const t=new app.dist.Configuration(this.clientConfig);this.streamingClient=new app.dist.OpenAIApi(t)}const r=e.stream?this.streamingClient:this.batchClient;return this.caller.call(r.createChatCompletion.bind(r),e,e.stream?{responseType:"stream"}:void 0)}_llmType(){return"openai"}_combineLLMOutput(...e){return e.reduce((r,t)=>(t&&t.tokenUsage&&(r.tokenUsage.completionTokens+=t.tokenUsage.completionTokens??0,r.tokenUsage.promptTokens+=t.tokenUsage.promptTokens??0,r.tokenUsage.totalTokens+=t.tokenUsage.totalTokens??0),r),{tokenUsage:{completionTokens:0,promptTokens:0,totalTokens:0}})}}exports.ChatOpenAI=ChatOpenAI;
