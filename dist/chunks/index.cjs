"use strict";const app=require("../shared/langchainjs.680cf161.cjs"),base=require("../shared/langchainjs.8b8699ed.cjs");require("path"),require("tty"),require("util"),require("fs"),require("net"),require("events"),require("stream"),require("zlib"),require("buffer"),require("string_decoder"),require("querystring"),require("url"),require("http"),require("crypto"),require("os"),require("https"),require("assert"),require("node:fs/promises"),require("node:path"),require("child_process");class Document{constructor(e){Object.defineProperty(this,"pageContent",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"metadata",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),this.pageContent=e?.pageContent??this.pageContent,this.metadata=e?.metadata??{}}}const HUB_PATH_REGEX=/lc(@[^:]+)?:\/\/(.*)/,URL_PATH_SEPARATOR="/",loadFromHub=async(i,e,t,n,r={})=>{const a=i.match(HUB_PATH_REGEX);if(!a)return;const[o,s]=a.slice(1),u=o?o.slice(1):process.env.LANGCHAIN_HUB_DEFAULT_REF??"master";if(s.split(URL_PATH_SEPARATOR)[0]!==t)return;if(!n.has(app.extname(s).slice(1)))throw new Error("Unsupported file type.");const c=[process.env.LANGCHAIN_HUB_URL_BASE??"https://raw.githubusercontent.com/hwchase17/langchain-hub/",u,s].join("/"),h=await app.fetchWithTimeout(c,{timeout:5e3});if(h.status!==200)throw new Error(`Could not find file at ${c}`);return e(await h.text(),s,r)};class BaseMessagePromptTemplate{serialize(){return{_type:this.constructor.name,...JSON.parse(JSON.stringify(this))}}}class BaseMessageStringPromptTemplate extends BaseMessagePromptTemplate{constructor(e){super(),Object.defineProperty(this,"prompt",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),this.prompt=e}get inputVariables(){return this.prompt.inputVariables}async formatMessages(e){return[await this.format(e)]}}class HumanMessagePromptTemplate extends BaseMessageStringPromptTemplate{async format(e){return new app.HumanChatMessage(await this.prompt.format(e))}constructor(e){super(e)}static fromTemplate(e){return new this(app.PromptTemplate.fromTemplate(e))}}class SystemMessagePromptTemplate extends BaseMessageStringPromptTemplate{async format(e){return new app.SystemChatMessage(await this.prompt.format(e))}constructor(e){super(e)}static fromTemplate(e){return new this(app.PromptTemplate.fromTemplate(e))}}class ChatPromptValue extends app.BasePromptValue{constructor(e){super(),Object.defineProperty(this,"messages",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),this.messages=e}toString(){return JSON.stringify(this.messages)}toChatMessages(){return this.messages}}class ChatPromptTemplate extends app.BasePromptTemplate{constructor(e){if(super(e),Object.defineProperty(this,"promptMessages",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"validateTemplate",{enumerable:!0,configurable:!0,writable:!0,value:!0}),Object.assign(this,e),this.validateTemplate){const t=new Set;for(const o of this.promptMessages)for(const s of o.inputVariables)t.add(s);const n=new Set([...this.inputVariables].filter(o=>!t.has(o)));if(n.size>0)throw new Error(`Input variables \`${[...n]}\` are not used in any of the prompt messages.`);const r=new Set(this.inputVariables),a=new Set([...t].filter(o=>!r.has(o)));if(a.size>0)throw new Error(`Input variables \`${[...a]}\` are used in prompt messages but not in the prompt template.`)}}_getPromptType(){return"chat"}async format(e){return(await this.formatPromptValue(e)).toString()}async formatPromptValue(e){let t=[];for(const n of this.promptMessages){const r={};for(const o of n.inputVariables){if(!(o in e))throw new Error(`Missing value for input variable \`${o}\``);r[o]=e[o]}const a=await n.formatMessages(r);t=t.concat(a)}return new ChatPromptValue(t)}serialize(){if(this.outputParser!==void 0)throw new Error("ChatPromptTemplate cannot be serialized if outputParser is set");return{input_variables:this.inputVariables,prompt_messages:this.promptMessages.map(e=>e.serialize())}}async partial(e){throw new Error("ChatPromptTemplate.partial() not yet implemented")}static fromPromptMessages(e){const t=new Set;for(const n of e)for(const r of n.inputVariables)t.add(r);return new ChatPromptTemplate({inputVariables:[...t],promptMessages:e})}}class StuffDocumentsChain extends app.BaseChain{get inputKeys(){return[this.inputKey,...this.llmChain.inputKeys]}constructor(e){super(),Object.defineProperty(this,"llmChain",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"inputKey",{enumerable:!0,configurable:!0,writable:!0,value:"input_documents"}),Object.defineProperty(this,"outputKey",{enumerable:!0,configurable:!0,writable:!0,value:"output_text"}),Object.defineProperty(this,"documentVariableName",{enumerable:!0,configurable:!0,writable:!0,value:"context"}),this.llmChain=e.llmChain,this.documentVariableName=e.documentVariableName??this.documentVariableName,this.inputKey=e.inputKey??this.inputKey,this.outputKey=e.outputKey??this.outputKey}async _call(e){if(!(this.inputKey in e))throw new Error(`Document key ${this.inputKey} not found.`);const{[this.inputKey]:t,...n}=e,a=t.map(({pageContent:s})=>s).join(`

`);return await this.llmChain.call({...n,[this.documentVariableName]:a})}_chainType(){return"stuff_documents_chain"}static async deserialize(e){const t=await app.resolveConfigFromFile("llm_chain",e);return new StuffDocumentsChain({llmChain:await app.LLMChain.deserialize(t)})}serialize(){return{_type:this._chainType(),llm_chain:this.llmChain.serialize()}}}class MapReduceDocumentsChain extends app.BaseChain{get inputKeys(){return[this.inputKey,...this.combineDocumentChain.inputKeys]}constructor(e){super(),Object.defineProperty(this,"llmChain",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"inputKey",{enumerable:!0,configurable:!0,writable:!0,value:"input_documents"}),Object.defineProperty(this,"outputKey",{enumerable:!0,configurable:!0,writable:!0,value:"output_text"}),Object.defineProperty(this,"documentVariableName",{enumerable:!0,configurable:!0,writable:!0,value:"context"}),Object.defineProperty(this,"maxTokens",{enumerable:!0,configurable:!0,writable:!0,value:3e3}),Object.defineProperty(this,"maxIterations",{enumerable:!0,configurable:!0,writable:!0,value:10}),Object.defineProperty(this,"combineDocumentChain",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),this.llmChain=e.llmChain,this.combineDocumentChain=e.combineDocumentChain,this.documentVariableName=e.documentVariableName??this.documentVariableName,this.inputKey=e.inputKey??this.inputKey,this.outputKey=e.outputKey??this.outputKey,this.maxTokens=e.maxTokens??this.maxTokens,this.maxIterations=e.maxIterations??this.maxIterations}async _call(e){if(!(this.inputKey in e))throw new Error(`Document key ${this.inputKey} not found.`);const{[this.inputKey]:t,...n}=e;let r=t;for(let s=0;s<this.maxIterations;s+=1){const u=r.map(m=>({[this.documentVariableName]:m.pageContent,...n})),l=u.map(async m=>{const b=await this.llmChain.prompt.format(m);return this.llmChain.llm.getNumTokens(b)});if(await Promise.all(l).then(m=>m.reduce((b,y)=>b+y,0))<this.maxTokens)break;const h=await this.llmChain.apply(u),{outputKey:p}=this.llmChain;r=h.map(m=>({pageContent:m[p]}))}const a={input_documents:r,...n};return await this.combineDocumentChain.call(a)}_chainType(){return"map_reduce_documents_chain"}static async deserialize(e){const t=await app.resolveConfigFromFile("llm_chain",e),n=await app.resolveConfigFromFile("combine_document_chain",e);return new MapReduceDocumentsChain({llmChain:await app.LLMChain.deserialize(t),combineDocumentChain:await app.BaseChain.deserialize(n)})}serialize(){return{_type:this._chainType(),llm_chain:this.llmChain.serialize(),combine_document_chain:this.combineDocumentChain.serialize()}}}class BasePromptSelector{}class ConditionalPromptSelector extends BasePromptSelector{constructor(e,t=[]){super(),Object.defineProperty(this,"defaultPrompt",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"conditionals",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),this.defaultPrompt=e,this.conditionals=t}getPrompt(e){for(const[t,n]of this.conditionals)if(t(e))return n;return this.defaultPrompt}}function isChatModel(i){return i instanceof base.BaseChatModel}const DEFAULT_QA_PROMPT=new app.PromptTemplate({template:`Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

{context}

Question: {question}
Helpful Answer:`,inputVariables:["context","question"]}),system_template$1=`Use the following pieces of context to answer the users question. 
If you don't know the answer, just say that you don't know, don't try to make up an answer.
----------------
{context}`,messages$1=[SystemMessagePromptTemplate.fromTemplate(system_template$1),HumanMessagePromptTemplate.fromTemplate("{question}")],CHAT_PROMPT=ChatPromptTemplate.fromPromptMessages(messages$1),QA_PROMPT_SELECTOR=new ConditionalPromptSelector(DEFAULT_QA_PROMPT,[[isChatModel,CHAT_PROMPT]]),qa_template$2=`Use the following portion of a long document to see if any of the text is relevant to answer the question. 
Return any relevant text verbatim.
{context}
Question: {question}
Relevant text, if any:`,DEFAULT_COMBINE_QA_PROMPT=app.PromptTemplate.fromTemplate(qa_template$2),system_template=`Use the following portion of a long document to see if any of the text is relevant to answer the question. 
Return any relevant text verbatim.
----------------
{context}`,messages=[SystemMessagePromptTemplate.fromTemplate(system_template),HumanMessagePromptTemplate.fromTemplate("{question}")],CHAT_QA_PROMPT=ChatPromptTemplate.fromPromptMessages(messages),COMBINE_QA_PROMPT_SELECTOR=new ConditionalPromptSelector(DEFAULT_COMBINE_QA_PROMPT,[[isChatModel,CHAT_QA_PROMPT]]),combine_prompt=`Given the following extracted parts of a long document and a question, create a final answer. 
If you don't know the answer, just say that you don't know. Don't try to make up an answer.

QUESTION: Which state/country's law governs the interpretation of the contract?
=========
Content: This Agreement is governed by English law and the parties submit to the exclusive jurisdiction of the English courts in  relation to any dispute (contractual or non-contractual) concerning this Agreement save that either party may apply to any court for an  injunction or other relief to protect its Intellectual Property Rights.

Content: No Waiver. Failure or delay in exercising any right or remedy under this Agreement shall not constitute a waiver of such (or any other)  right or remedy.

11.7 Severability. The invalidity, illegality or unenforceability of any term (or part of a term) of this Agreement shall not affect the continuation  in force of the remainder of the term (if any) and this Agreement.

11.8 No Agency. Except as expressly stated otherwise, nothing in this Agreement shall create an agency, partnership or joint venture of any  kind between the parties.

11.9 No Third-Party Beneficiaries.

Content: (b) if Google believes, in good faith, that the Distributor has violated or caused Google to violate any Anti-Bribery Laws (as  defined in Clause 8.5) or that such a violation is reasonably likely to occur,
=========
FINAL ANSWER: This Agreement is governed by English law.

QUESTION: What did the president say about Michael Jackson?
=========
Content: Madam Speaker, Madam Vice President, our First Lady and Second Gentleman. Members of Congress and the Cabinet. Justices of the Supreme Court. My fellow Americans.  

Last year COVID-19 kept us apart. This year we are finally together again. 

Tonight, we meet as Democrats Republicans and Independents. But most importantly as Americans. 

With a duty to one another to the American people to the Constitution. 

And with an unwavering resolve that freedom will always triumph over tyranny. 

Six days ago, Russia\u2019s Vladimir Putin sought to shake the foundations of the free world thinking he could make it bend to his menacing ways. But he badly miscalculated. 

He thought he could roll into Ukraine and the world would roll over. Instead he met a wall of strength he never imagined. 

He met the Ukrainian people. 

From President Zelenskyy to every Ukrainian, their fearlessness, their courage, their determination, inspires the world. 

Groups of citizens blocking tanks with their bodies. Everyone from students to retirees teachers turned soldiers defending their homeland.

Content: And we won\u2019t stop. 

We have lost so much to COVID-19. Time with one another. And worst of all, so much loss of life. 

Let\u2019s use this moment to reset. Let\u2019s stop looking at COVID-19 as a partisan dividing line and see it for what it is: A God-awful disease.  

Let\u2019s stop seeing each other as enemies, and start seeing each other for who we really are: Fellow Americans.  

We can\u2019t change how divided we\u2019ve been. But we can change how we move forward\u2014on COVID-19 and other issues we must face together. 

I recently visited the New York City Police Department days after the funerals of Officer Wilbert Mora and his partner, Officer Jason Rivera. 

They were responding to a 9-1-1 call when a man shot and killed them with a stolen gun. 

Officer Mora was 27 years old. 

Officer Rivera was 22. 

Both Dominican Americans who\u2019d grown up on the same streets they later chose to patrol as police officers. 

I spoke with their families and told them that we are forever in debt for their sacrifice, and we will carry on their mission to restore the trust and safety every community deserves.

Content: And a proud Ukrainian people, who have known 30 years  of independence, have repeatedly shown that they will not tolerate anyone who tries to take their country backwards.  

To all Americans, I will be honest with you, as I\u2019ve always promised. A Russian dictator, invading a foreign country, has costs around the world. 

And I\u2019m taking robust action to make sure the pain of our sanctions  is targeted at Russia\u2019s economy. And I will use every tool at our disposal to protect American businesses and consumers. 

Tonight, I can announce that the United States has worked with 30 other countries to release 60 Million barrels of oil from reserves around the world.  

America will lead that effort, releasing 30 Million barrels from our own Strategic Petroleum Reserve. And we stand ready to do more if necessary, unified with our allies.  

These steps will help blunt gas prices here at home. And I know the news about what\u2019s happening can seem alarming. 

But I want you to know that we are going to be okay.

Content: More support for patients and families. 

To get there, I call on Congress to fund ARPA-H, the Advanced Research Projects Agency for Health. 

It\u2019s based on DARPA\u2014the Defense Department project that led to the Internet, GPS, and so much more.  

ARPA-H will have a singular purpose\u2014to drive breakthroughs in cancer, Alzheimer\u2019s, diabetes, and more. 

A unity agenda for the nation. 

We can do this. 

My fellow Americans\u2014tonight , we have gathered in a sacred space\u2014the citadel of our democracy. 

In this Capitol, generation after generation, Americans have debated great questions amid great strife, and have done great things. 

We have fought for freedom, expanded liberty, defeated totalitarianism and terror. 

And built the strongest, freest, and most prosperous nation the world has ever known. 

Now is the hour. 

Our moment of responsibility. 

Our test of resolve and conscience, of history itself. 

It is in this moment that our character is formed. Our purpose is found. Our future is forged. 

Well I know this nation.
=========
FINAL ANSWER: The president did not mention Michael Jackson.

QUESTION: {question}
=========
{summaries}
=========
FINAL ANSWER:`,COMBINE_PROMPT=app.PromptTemplate.fromTemplate(combine_prompt),system_combine_template=`Given the following extracted parts of a long document and a question, create a final answer. 
If you don't know the answer, just say that you don't know. Don't try to make up an answer.
----------------
{summaries}`,combine_messages=[SystemMessagePromptTemplate.fromTemplate(system_combine_template),HumanMessagePromptTemplate.fromTemplate("{question}")],CHAT_COMBINE_PROMPT=ChatPromptTemplate.fromPromptMessages(combine_messages),COMBINE_PROMPT_SELECTOR=new ConditionalPromptSelector(COMBINE_PROMPT,[[isChatModel,CHAT_COMBINE_PROMPT]]),loadQAChain=(i,e={})=>{const{prompt:t=DEFAULT_QA_PROMPT,combineMapPrompt:n=DEFAULT_COMBINE_QA_PROMPT,combinePrompt:r=COMBINE_PROMPT,type:a="stuff"}=e;if(a==="stuff"){const o=new app.LLMChain({prompt:t,llm:i});return new StuffDocumentsChain({llmChain:o})}if(a==="map_reduce"){const o=new app.LLMChain({prompt:n,llm:i}),s=new app.LLMChain({prompt:r,llm:i}),u=new StuffDocumentsChain({llmChain:s,documentVariableName:"summaries"});return new MapReduceDocumentsChain({llmChain:o,combineDocumentChain:u})}throw new Error(`Invalid _type: ${a}`)},loadQAStuffChain=(i,e={})=>{const{prompt:t=QA_PROMPT_SELECTOR.getPrompt(i)}=e,n=new app.LLMChain({prompt:t,llm:i});return new StuffDocumentsChain({llmChain:n})},loadQAMapReduceChain=(i,e={})=>{const{combineMapPrompt:t=COMBINE_QA_PROMPT_SELECTOR.getPrompt(i),combinePrompt:n=COMBINE_PROMPT_SELECTOR.getPrompt(i)}=e,r=new app.LLMChain({prompt:t,llm:i}),a=new app.LLMChain({prompt:n,llm:i}),o=new StuffDocumentsChain({llmChain:a,documentVariableName:"summaries"});return new MapReduceDocumentsChain({llmChain:r,combineDocumentChain:o})},question_generator_template$1=`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`,qa_template$1=`Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

{context}

Question: {question}
Helpful Answer:`;class ChatVectorDBQAChain extends app.BaseChain{get inputKeys(){return[this.inputKey,this.chatHistoryKey]}constructor(e){super(),Object.defineProperty(this,"k",{enumerable:!0,configurable:!0,writable:!0,value:4}),Object.defineProperty(this,"inputKey",{enumerable:!0,configurable:!0,writable:!0,value:"question"}),Object.defineProperty(this,"chatHistoryKey",{enumerable:!0,configurable:!0,writable:!0,value:"chat_history"}),Object.defineProperty(this,"outputKey",{enumerable:!0,configurable:!0,writable:!0,value:"result"}),Object.defineProperty(this,"vectorstore",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"combineDocumentsChain",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"questionGeneratorChain",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"returnSourceDocuments",{enumerable:!0,configurable:!0,writable:!0,value:!1}),this.vectorstore=e.vectorstore,this.combineDocumentsChain=e.combineDocumentsChain,this.questionGeneratorChain=e.questionGeneratorChain,this.inputKey=e.inputKey??this.inputKey,this.outputKey=e.outputKey??this.outputKey,this.k=e.k??this.k,this.returnSourceDocuments=e.returnSourceDocuments??this.returnSourceDocuments}async _call(e){if(!(this.inputKey in e))throw new Error(`Question key ${this.inputKey} not found.`);if(!(this.chatHistoryKey in e))throw new Error(`chat history key ${this.inputKey} not found.`);const t=e[this.inputKey],n=e[this.chatHistoryKey];let r=t;if(n.length>0){const u=await this.questionGeneratorChain.call({question:t,chat_history:n}),l=Object.keys(u);if(l.length===1)r=u[l[0]];else throw new Error("Return from llm chain has multiple values, only single values supported.")}const a=await this.vectorstore.similaritySearch(r,this.k),o={question:r,input_documents:a,chat_history:n},s=await this.combineDocumentsChain.call(o);return this.returnSourceDocuments?{...s,sourceDocuments:a}:s}_chainType(){return"chat-vector-db"}static async deserialize(e,t){if(!("vectorstore"in t))throw new Error("Need to pass in a vectorstore to deserialize VectorDBQAChain");const{vectorstore:n}=t,r=await app.resolveConfigFromFile("combine_documents_chain",e),a=await app.resolveConfigFromFile("question_generator",e);return new ChatVectorDBQAChain({combineDocumentsChain:await app.BaseChain.deserialize(r),questionGeneratorChain:await app.LLMChain.deserialize(a),k:e.k,vectorstore:n})}serialize(){return{_type:this._chainType(),combine_documents_chain:this.combineDocumentsChain.serialize(),question_generator:this.questionGeneratorChain.serialize(),k:this.k}}static fromLLM(e,t,n={}){const{questionGeneratorTemplate:r,qaTemplate:a,...o}=n,s=app.PromptTemplate.fromTemplate(r||question_generator_template$1),u=app.PromptTemplate.fromTemplate(a||qa_template$1),l=loadQAStuffChain(e,{prompt:u}),c=new app.LLMChain({prompt:s,llm:e});return new this({vectorstore:t,combineDocumentsChain:l,questionGeneratorChain:c,...o})}}class TextSplitter{constructor(e){if(Object.defineProperty(this,"chunkSize",{enumerable:!0,configurable:!0,writable:!0,value:1e3}),Object.defineProperty(this,"chunkOverlap",{enumerable:!0,configurable:!0,writable:!0,value:200}),this.chunkSize=e?.chunkSize??this.chunkSize,this.chunkOverlap=e?.chunkOverlap??this.chunkOverlap,this.chunkOverlap>=this.chunkSize)throw new Error("Cannot have chunkOverlap >= chunkSize")}async createDocuments(e,t=[]){const n=t.length>0?t:new Array(e.length).fill({}),r=new Array;for(let a=0;a<e.length;a+=1){const o=e[a];for(const s of await this.splitText(o))r.push(new Document({pageContent:s,metadata:n[a]}))}return r}async splitDocuments(e){const t=e.map(r=>r.pageContent),n=e.map(r=>r.metadata);return this.createDocuments(t,n)}joinDocs(e,t){const n=e.join(t).trim();return n===""?null:n}mergeSplits(e,t){const n=[],r=[];let a=0;for(const s of e){const u=s.length;if(a+u>=this.chunkSize&&(a>this.chunkSize&&console.warn(`Created a chunk of size ${a}, +
which is longer than the specified ${this.chunkSize}`),r.length>0)){const l=this.joinDocs(r,t);for(l!==null&&n.push(l);a>this.chunkOverlap||a+u>this.chunkSize&&a>0;)a-=r[0].length,r.shift()}r.push(s),a+=u}const o=this.joinDocs(r,t);return o!==null&&n.push(o),n}}class RecursiveCharacterTextSplitter extends TextSplitter{constructor(e){super(e),Object.defineProperty(this,"separators",{enumerable:!0,configurable:!0,writable:!0,value:[`

`,`
`," ",""]}),this.separators=e?.separators??this.separators}async splitText(e){const t=[];let n=this.separators[this.separators.length-1];for(const o of this.separators){if(o===""){n=o;break}if(e.includes(o)){n=o;break}}let r;n?r=e.split(n):r=e.split("");let a=[];for(const o of r)if(o.length<this.chunkSize)a.push(o);else{if(a.length){const u=this.mergeSplits(a,n);t.push(...u),a=[]}const s=await this.splitText(o);t.push(...s)}if(a.length){const o=this.mergeSplits(a,n);t.push(...o)}return t}}class AnalyzeDocumentChain extends app.BaseChain{constructor(e){super(),Object.defineProperty(this,"inputKey",{enumerable:!0,configurable:!0,writable:!0,value:"input_document"}),Object.defineProperty(this,"outputKey",{enumerable:!0,configurable:!0,writable:!0,value:"output_text"}),Object.defineProperty(this,"combineDocumentsChain",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"textSplitter",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),this.combineDocumentsChain=e.combineDocumentsChain,this.inputKey=e.inputKey??this.inputKey,this.outputKey=e.outputKey??this.outputKey,this.textSplitter=e.textSplitter??new RecursiveCharacterTextSplitter}get inputKeys(){return[this.inputKey]}async _call(e){if(!(this.inputKey in e))throw new Error(`Document key ${this.inputKey} not found.`);const{[this.inputKey]:t,...n}=e,r=t,o={input_documents:await this.textSplitter.createDocuments([r]),...n};return await this.combineDocumentsChain.call(o)}_chainType(){return"analyze_document_chain"}static async deserialize(e,t){if(!("text_splitter"in t))throw new Error("Need to pass in a text_splitter to deserialize AnalyzeDocumentChain.");const{text_splitter:n}=t,r=await app.resolveConfigFromFile("combine_document_chain",e);return new AnalyzeDocumentChain({combineDocumentsChain:await app.BaseChain.deserialize(r),textSplitter:n})}serialize(){return{_type:this._chainType(),combine_document_chain:this.combineDocumentsChain.serialize()}}}class VectorDBQAChain extends app.BaseChain{get inputKeys(){return[this.inputKey]}constructor(e){super(),Object.defineProperty(this,"k",{enumerable:!0,configurable:!0,writable:!0,value:4}),Object.defineProperty(this,"inputKey",{enumerable:!0,configurable:!0,writable:!0,value:"query"}),Object.defineProperty(this,"outputKey",{enumerable:!0,configurable:!0,writable:!0,value:"result"}),Object.defineProperty(this,"vectorstore",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"combineDocumentsChain",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"returnSourceDocuments",{enumerable:!0,configurable:!0,writable:!0,value:!1}),this.vectorstore=e.vectorstore,this.combineDocumentsChain=e.combineDocumentsChain,this.inputKey=e.inputKey??this.inputKey,this.outputKey=e.outputKey??this.outputKey,this.k=e.k??this.k,this.returnSourceDocuments=e.returnSourceDocuments??this.returnSourceDocuments}async _call(e){if(!(this.inputKey in e))throw new Error(`Question key ${this.inputKey} not found.`);const t=e[this.inputKey],n=await this.vectorstore.similaritySearch(t,this.k),r={question:t,input_documents:n},a=await this.combineDocumentsChain.call(r);return this.returnSourceDocuments?{...a,sourceDocuments:n}:a}_chainType(){return"vector_db_qa"}static async deserialize(e,t){if(!("vectorstore"in t))throw new Error("Need to pass in a vectorstore to deserialize VectorDBQAChain");const{vectorstore:n}=t,r=await app.resolveConfigFromFile("combine_documents_chain",e);return new VectorDBQAChain({combineDocumentsChain:await app.BaseChain.deserialize(r),k:e.k,vectorstore:n})}serialize(){return{_type:this._chainType(),combine_documents_chain:this.combineDocumentsChain.serialize(),k:this.k}}static fromLLM(e,t,n){const r=loadQAStuffChain(e);return new this({vectorstore:t,combineDocumentsChain:r,...n})}}const loadChainFromFile=async(i,e,t={})=>{const n=app.parseFileConfig(i,e);return app.BaseChain.deserialize(n,t)},loadChain=async(i,e={})=>{const t=await loadFromHub(i,loadChainFromFile,"chains",new Set(["json","yaml"]),e);return t||app.loadFromFile(i,loadChainFromFile,e)},template=`Write a concise summary of the following:


"{text}"


CONCISE SUMMARY:`,DEFAULT_PROMPT=new app.PromptTemplate({template,inputVariables:["text"]}),loadSummarizationChain=(i,e={})=>{const{prompt:t=DEFAULT_PROMPT,combineMapPrompt:n=DEFAULT_PROMPT,combinePrompt:r=DEFAULT_PROMPT,type:a="map_reduce"}=e;if(a==="stuff"){const o=new app.LLMChain({prompt:t,llm:i});return new StuffDocumentsChain({llmChain:o,documentVariableName:"text"})}if(a==="map_reduce"){const o=new app.LLMChain({prompt:n,llm:i}),s=new app.LLMChain({prompt:r,llm:i}),u=new StuffDocumentsChain({llmChain:s,documentVariableName:"text"});return new MapReduceDocumentsChain({llmChain:o,combineDocumentChain:u,documentVariableName:"text"})}throw new Error(`Invalid _type: ${a}`)},DEFAULT_SQL_DATABASE_PROMPT=new app.PromptTemplate({template:`Given an input question, first create a syntactically correct {dialect} query to run, then look at the results of the query and return the answer. Unless the user specifies in his question a specific number of examples he wishes to obtain, always limit your query to at most {top_k} results. You can order the results by a relevant column to return the most interesting examples in the database.

Never query for all the columns from a specific table, only ask for a the few relevant columns given the question.

Pay attention to use only the column names that you can see in the schema description. Be careful to not query for columns that do not exist. Also, pay attention to which column is in which table.

Use the following format:

Question: "Question here"
SQLQuery: "SQL Query to run"
SQLResult: "Result of the SQLQuery"
Answer: "Final answer here"

Only use the tables listed below.

{table_info}

Question: {input}`,inputVariables:["dialect","table_info","input","top_k"]}),verifyListTablesExistInDatabase=(i,e,t)=>{const n=i.map(r=>r.tableName);if(e.length>0){for(const r of e)if(!n.includes(r))throw new Error(`${t} the table ${r} was not found in the database`)}},verifyIncludeTablesExistInDatabase=(i,e)=>{verifyListTablesExistInDatabase(i,e,"Include tables not found in database:")},verifyIgnoreTablesExistInDatabase=(i,e)=>{verifyListTablesExistInDatabase(i,e,"Ignore tables not found in database:")},formatToSqlTable=i=>{const e=[];for(const t of i){const n={columnName:t.column_name,dataType:t.data_type,isNullable:t.is_nullable==="YES"},r=e.find(a=>a.tableName===t.table_name);if(r)r.columns.push(n);else{const a={tableName:t.table_name,columns:[n]};e.push(a)}}return e},getTableAndColumnsName=async i=>{let e;if(i.options.type==="postgres"){e=`SELECT
    t.table_name,
    c.*
FROM
    information_schema.tables t
        JOIN information_schema.columns c
             ON t.table_name = c.table_name
WHERE
        t.table_schema = 'public'
ORDER BY
    t.table_name,
    c.ordinal_position;`;const t=await i.query(e);return formatToSqlTable(t)}if(i.options.type==="sqlite"){e=`SELECT 
   m.name AS table_name,
   p.name AS column_name,
   p.type AS data_type,
   CASE 
      WHEN p."notnull" = 0 THEN 'YES' 
      ELSE 'NO' 
   END AS is_nullable 
FROM 
   sqlite_master m 
JOIN 
   pragma_table_info(m.name) p 
WHERE 
   m.type = 'table' AND 
   m.name NOT LIKE 'sqlite_%';
`;const t=await i.query(e);return formatToSqlTable(t)}if(i.options.type==="mysql"){e=`SELECT TABLE_NAME AS table_name, COLUMN_NAME AS column_name, DATA_TYPE AS data_type, IS_NULLABLE AS is_nullable FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '${i.options.database}';`;const t=await i.query(e);return formatToSqlTable(t)}throw new Error("Database type not implemented yet")},formatSqlResponseToSimpleTableString=i=>{if(!i||!Array.isArray(i)||i.length===0)return"";let e="";for(const t of i)e+=`${Object.values(t).reduce((n,r)=>`${n} ${r}`,"")}
`;return e},generateTableInfoFromTables=async(i,e,t)=>{if(!i)return"";let n="";for(const r of i){let a=`CREATE TABLE ${r.tableName} (
`;for(const[l,c]of r.columns.entries())l>0&&(a+=", "),a+=`${c.columnName} ${c.dataType} ${c.isNullable?"":"NOT NULL"}`;a+=`) 
`;let o;e.options.type==="mysql"?o=`SELECT * FROM \`${r.tableName}\` LIMIT ${t};
`:o=`SELECT * FROM "${r.tableName}" LIMIT ${t};
`;const s=`${r.columns.reduce((l,c)=>`${l} ${c.columnName}`,"")}
`;let u="";try{const l=await e.query(o);u=formatSqlResponseToSimpleTableString(l)}catch(l){console.log(l)}n=n.concat(a+o+s+u)}return n};class SqlDatabase{constructor(e){if(Object.defineProperty(this,"appDataSourceOptions",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"appDataSource",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"allTables",{enumerable:!0,configurable:!0,writable:!0,value:[]}),Object.defineProperty(this,"includesTables",{enumerable:!0,configurable:!0,writable:!0,value:[]}),Object.defineProperty(this,"ignoreTables",{enumerable:!0,configurable:!0,writable:!0,value:[]}),Object.defineProperty(this,"sampleRowsInTableInfo",{enumerable:!0,configurable:!0,writable:!0,value:3}),this.appDataSource=e.appDataSource,this.appDataSourceOptions=e.appDataSource.options,e?.includesTables&&e?.ignoreTables)throw new Error("Cannot specify both include_tables and ignoreTables");this.includesTables=e?.includesTables??[],this.ignoreTables=e?.ignoreTables??[],this.sampleRowsInTableInfo=e?.sampleRowsInTableInfo??this.sampleRowsInTableInfo}static async fromDataSourceParams(e){const t=new SqlDatabase(e);return t.appDataSource.isInitialized||await t.appDataSource.initialize(),t.allTables=await getTableAndColumnsName(t.appDataSource),verifyIncludeTablesExistInDatabase(t.allTables,t.includesTables),verifyIgnoreTablesExistInDatabase(t.allTables,t.ignoreTables),t}static async fromOptionsParams(e){const{DataSource:t}=await import("typeorm"),n=new t(e.appDataSourceOptions);return SqlDatabase.fromDataSourceParams({...e,appDataSource:n})}async getTableInfo(e){let t=this.allTables;return e&&e.length>0&&(verifyListTablesExistInDatabase(this.allTables,e,"Wrong target table name:"),t=this.allTables.filter(n=>e.includes(n.tableName))),generateTableInfoFromTables(t,this.appDataSource,this.sampleRowsInTableInfo)}async run(e,t="all"){const n=await this.appDataSource.query(e);return t==="all"?JSON.stringify(n):n?.length>0?JSON.stringify(n[0]):""}serialize(){return{_type:"sql_database",appDataSourceOptions:this.appDataSourceOptions,includesTables:this.includesTables,ignoreTables:this.ignoreTables,sampleRowsInTableInfo:this.sampleRowsInTableInfo}}static async imports(){try{const{DataSource:e}=await import("typeorm");return{DataSource:e}}catch(e){throw console.error(e),new Error("Failed to load typeorm. Please install it with eg. `yarn add typeorm`.")}}}class SqlDatabaseChain extends app.BaseChain{constructor(e){const{memory:t}=e;super(t),Object.defineProperty(this,"llm",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"database",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"prompt",{enumerable:!0,configurable:!0,writable:!0,value:DEFAULT_SQL_DATABASE_PROMPT}),Object.defineProperty(this,"topK",{enumerable:!0,configurable:!0,writable:!0,value:5}),Object.defineProperty(this,"inputKey",{enumerable:!0,configurable:!0,writable:!0,value:"query"}),Object.defineProperty(this,"outputKey",{enumerable:!0,configurable:!0,writable:!0,value:"result"}),Object.defineProperty(this,"returnDirect",{enumerable:!0,configurable:!0,writable:!0,value:!1}),this.llm=e.llm,this.database=e.database,this.inputKey=e.inputKey??this.inputKey,this.outputKey=e.outputKey??this.outputKey}async _call(e){const t=new app.LLMChain({prompt:this.prompt,llm:this.llm,outputKey:this.outputKey,memory:this.memory});if(!(this.inputKey in e))throw new Error(`Question key ${this.inputKey} not found.`);let r=`${e[this.inputKey]}
SQLQuery:`;const a=e.table_names_to_use,o=await this.database.getTableInfo(a),s={input:r,top_k:this.topK,dialect:this.database.appDataSourceOptions.type,table_info:o,stop:[`
SQLResult:`]},u=[],l=await t.predict(s);u.push(l);let c="";try{c=await this.database.appDataSource.query(l),u.push(c)}catch(p){console.error(p)}let h;return this.returnDirect?h={result:c}:(r+=`${+l}
SQLResult: ${JSON.stringify(c)}
Answer:`,s.input=r,h={result:await t.predict(s)}),h}_chainType(){return"sql_database_chain"}get inputKeys(){return[this.inputKey]}static async deserialize(e){const t=await app.resolveConfigFromFile("llm",e),n=await app.BaseLanguageModel.deserialize(t),r=await app.resolveConfigFromFile("sql_database",e),a=await SqlDatabase.fromOptionsParams(r);return new SqlDatabaseChain({llm:n,database:a})}serialize(){return{_type:this._chainType(),llm:this.llm.serialize(),sql_database:this.database.serialize()}}}const question_generator_template=`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`,qa_template=`Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

{context}

Question: {question}
Helpful Answer:`;class ConversationalRetrievalQAChain extends app.BaseChain{get inputKeys(){return[this.inputKey,this.chatHistoryKey]}constructor(e){super(),Object.defineProperty(this,"inputKey",{enumerable:!0,configurable:!0,writable:!0,value:"question"}),Object.defineProperty(this,"chatHistoryKey",{enumerable:!0,configurable:!0,writable:!0,value:"chat_history"}),Object.defineProperty(this,"outputKey",{enumerable:!0,configurable:!0,writable:!0,value:"result"}),Object.defineProperty(this,"retriever",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"combineDocumentsChain",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"questionGeneratorChain",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"returnSourceDocuments",{enumerable:!0,configurable:!0,writable:!0,value:!1}),this.retriever=e.retriever,this.combineDocumentsChain=e.combineDocumentsChain,this.questionGeneratorChain=e.questionGeneratorChain,this.inputKey=e.inputKey??this.inputKey,this.outputKey=e.outputKey??this.outputKey,this.returnSourceDocuments=e.returnSourceDocuments??this.returnSourceDocuments}async _call(e){if(!(this.inputKey in e))throw new Error(`Question key ${this.inputKey} not found.`);if(!(this.chatHistoryKey in e))throw new Error(`chat history key ${this.inputKey} not found.`);const t=e[this.inputKey],n=e[this.chatHistoryKey];let r=t;if(n.length>0){const u=await this.questionGeneratorChain.call({question:t,chat_history:n}),l=Object.keys(u);if(l.length===1)r=u[l[0]];else throw new Error("Return from llm chain has multiple values, only single values supported.")}const a=await this.retriever.getRelevantDocuments(r),o={question:r,input_documents:a,chat_history:n},s=await this.combineDocumentsChain.call(o);return this.returnSourceDocuments?{...s,sourceDocuments:a}:s}_chainType(){return"conversational_retrieval_chain"}static async deserialize(e,t){throw new Error("Not implemented.")}serialize(){throw new Error("Not implemented.")}static fromLLM(e,t,n={}){const{questionGeneratorTemplate:r,qaTemplate:a,...o}=n,s=app.PromptTemplate.fromTemplate(r||question_generator_template),u=app.PromptTemplate.fromTemplate(a||qa_template),l=loadQAStuffChain(e,{prompt:u}),c=new app.LLMChain({prompt:s,llm:e});return new this({retriever:t,combineDocumentsChain:l,questionGeneratorChain:c,...o})}}class RetrievalQAChain extends app.BaseChain{get inputKeys(){return[this.inputKey]}constructor(e){super(),Object.defineProperty(this,"inputKey",{enumerable:!0,configurable:!0,writable:!0,value:"query"}),Object.defineProperty(this,"outputKey",{enumerable:!0,configurable:!0,writable:!0,value:"result"}),Object.defineProperty(this,"retriever",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"combineDocumentsChain",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"returnSourceDocuments",{enumerable:!0,configurable:!0,writable:!0,value:!1}),this.retriever=e.retriever,this.combineDocumentsChain=e.combineDocumentsChain,this.inputKey=e.inputKey??this.inputKey,this.outputKey=e.outputKey??this.outputKey,this.returnSourceDocuments=e.returnSourceDocuments??this.returnSourceDocuments}async _call(e){if(!(this.inputKey in e))throw new Error(`Question key ${this.inputKey} not found.`);const t=e[this.inputKey],n=await this.retriever.getRelevantDocuments(t),r={question:t,input_documents:n},a=await this.combineDocumentsChain.call(r);return this.returnSourceDocuments?{...a,sourceDocuments:n}:a}_chainType(){return"retrieval_qa"}static async deserialize(e,t){throw new Error("Not implemented")}serialize(){throw new Error("Not implemented")}static fromLLM(e,t,n){const r=loadQAStuffChain(e);return new this({retriever:t,combineDocumentsChain:r,...n})}}exports.BaseChain=app.BaseChain,exports.ConversationChain=app.ConversationChain,exports.LLMChain=app.LLMChain,exports.AnalyzeDocumentChain=AnalyzeDocumentChain,exports.ChatVectorDBQAChain=ChatVectorDBQAChain,exports.ConversationalRetrievalQAChain=ConversationalRetrievalQAChain,exports.MapReduceDocumentsChain=MapReduceDocumentsChain,exports.RetrievalQAChain=RetrievalQAChain,exports.SqlDatabaseChain=SqlDatabaseChain,exports.StuffDocumentsChain=StuffDocumentsChain,exports.VectorDBQAChain=VectorDBQAChain,exports.loadChain=loadChain,exports.loadQAChain=loadQAChain,exports.loadQAMapReduceChain=loadQAMapReduceChain,exports.loadQAStuffChain=loadQAStuffChain,exports.loadSummarizationChain=loadSummarizationChain;
