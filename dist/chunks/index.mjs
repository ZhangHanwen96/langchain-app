import{e as z,f as Q,B as m,r as b,L as h,a as H,P as y,C as T,S as O,H as D,l as $,p as U,b as F}from"../shared/langchainjs.4fe061aa.mjs";export{c as ConversationChain}from"../shared/langchainjs.4fe061aa.mjs";import"path";import"tty";import"util";import"fs";import"net";import"events";import"stream";import"zlib";import"buffer";import"string_decoder";import"querystring";import"url";import"http";import"crypto";import"os";import"https";import"assert";class B{constructor(e){Object.defineProperty(this,"pageContent",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"metadata",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),this.pageContent=e?.pageContent??this.pageContent,this.metadata=e?.metadata??{}}}const G=/lc(@[^:]+)?:\/\/(.*)/,V="/",W=async(i,e,t,n,r={})=>{const o=i.match(G);if(!o)return;const[a,s]=o.slice(1),u=a?a.slice(1):process.env.LANGCHAIN_HUB_DEFAULT_REF??"master";if(s.split(V)[0]!==t)return;if(!n.has(z(s).slice(1)))throw new Error("Unsupported file type.");const l=[process.env.LANGCHAIN_HUB_URL_BASE??"https://raw.githubusercontent.com/hwchase17/langchain-hub/",u,s].join("/"),p=await Q(l,{timeout:5e3});if(p.status!==200)throw new Error(`Could not find file at ${l}`);return e(await p.text(),s,r)};class d extends m{get inputKeys(){return[this.inputKey,...this.llmChain.inputKeys]}constructor(e){super(),Object.defineProperty(this,"llmChain",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"inputKey",{enumerable:!0,configurable:!0,writable:!0,value:"input_documents"}),Object.defineProperty(this,"outputKey",{enumerable:!0,configurable:!0,writable:!0,value:"output_text"}),Object.defineProperty(this,"documentVariableName",{enumerable:!0,configurable:!0,writable:!0,value:"context"}),this.llmChain=e.llmChain,this.documentVariableName=e.documentVariableName??this.documentVariableName,this.inputKey=e.inputKey??this.inputKey,this.outputKey=e.outputKey??this.outputKey}async _call(e){if(!(this.inputKey in e))throw new Error(`Document key ${this.inputKey} not found.`);const{[this.inputKey]:t,...n}=e,o=t.map(({pageContent:s})=>s).join(`

`);return await this.llmChain.call({...n,[this.documentVariableName]:o})}_chainType(){return"stuff_documents_chain"}static async deserialize(e){const t=await b("llm_chain",e);return new d({llmChain:await h.deserialize(t)})}serialize(){return{_type:this._chainType(),llm_chain:this.llmChain.serialize()}}}class w extends m{get inputKeys(){return[this.inputKey,...this.combineDocumentChain.inputKeys]}constructor(e){super(),Object.defineProperty(this,"llmChain",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"inputKey",{enumerable:!0,configurable:!0,writable:!0,value:"input_documents"}),Object.defineProperty(this,"outputKey",{enumerable:!0,configurable:!0,writable:!0,value:"output_text"}),Object.defineProperty(this,"documentVariableName",{enumerable:!0,configurable:!0,writable:!0,value:"context"}),Object.defineProperty(this,"maxTokens",{enumerable:!0,configurable:!0,writable:!0,value:3e3}),Object.defineProperty(this,"maxIterations",{enumerable:!0,configurable:!0,writable:!0,value:10}),Object.defineProperty(this,"combineDocumentChain",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),this.llmChain=e.llmChain,this.combineDocumentChain=e.combineDocumentChain,this.documentVariableName=e.documentVariableName??this.documentVariableName,this.inputKey=e.inputKey??this.inputKey,this.outputKey=e.outputKey??this.outputKey,this.maxTokens=e.maxTokens??this.maxTokens,this.maxIterations=e.maxIterations??this.maxIterations}async _call(e){if(!(this.inputKey in e))throw new Error(`Document key ${this.inputKey} not found.`);const{[this.inputKey]:t,...n}=e;let r=t;for(let s=0;s<this.maxIterations;s+=1){const u=r.map(f=>({[this.documentVariableName]:f.pageContent,...n})),c=u.map(async f=>{const _=await this.llmChain.prompt.format(f);return this.llmChain.llm.getNumTokens(_)});if(await Promise.all(c).then(f=>f.reduce((_,M)=>_+M,0))<this.maxTokens)break;const p=await this.llmChain.apply(u),{outputKey:C}=this.llmChain;r=p.map(f=>({pageContent:f[C]}))}const o={input_documents:r,...n};return await this.combineDocumentChain.call(o)}_chainType(){return"map_reduce_documents_chain"}static async deserialize(e){const t=await b("llm_chain",e),n=await b("combine_document_chain",e);return new w({llmChain:await h.deserialize(t),combineDocumentChain:await m.deserialize(n)})}serialize(){return{_type:this._chainType(),llm_chain:this.llmChain.serialize(),combine_document_chain:this.combineDocumentChain.serialize()}}}class J{}class S extends J{constructor(e,t=[]){super(),Object.defineProperty(this,"defaultPrompt",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"conditionals",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),this.defaultPrompt=e,this.conditionals=t}getPrompt(e){for(const[t,n]of this.conditionals)if(t(e))return n;return this.defaultPrompt}}function P(i){return i instanceof H}const j=new y({template:`Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

{context}

Question: {question}
Helpful Answer:`,inputVariables:["context","question"]}),Y=`Use the following pieces of context to answer the users question. 
If you don't know the answer, just say that you don't know, don't try to make up an answer.
----------------
{context}`,X=[O.fromTemplate(Y),D.fromTemplate("{question}")],Z=T.fromPromptMessages(X),ee=new S(j,[[P,Z]]),te=`Use the following portion of a long document to see if any of the text is relevant to answer the question. 
Return any relevant text verbatim.
{context}
Question: {question}
Relevant text, if any:`,x=y.fromTemplate(te),ne=`Use the following portion of a long document to see if any of the text is relevant to answer the question. 
Return any relevant text verbatim.
----------------
{context}`,re=[O.fromTemplate(ne),D.fromTemplate("{question}")],oe=T.fromPromptMessages(re),ie=new S(x,[[P,oe]]),ae=`Given the following extracted parts of a long document and a question, create a final answer. 
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
FINAL ANSWER:`,L=y.fromTemplate(ae),se=`Given the following extracted parts of a long document and a question, create a final answer. 
If you don't know the answer, just say that you don't know. Don't try to make up an answer.
----------------
{summaries}`,ue=[O.fromTemplate(se),D.fromTemplate("{question}")],ce=T.fromPromptMessages(ue),le=new S(L,[[P,ce]]),he=(i,e={})=>{const{prompt:t=j,combineMapPrompt:n=x,combinePrompt:r=L,type:o="stuff"}=e;if(o==="stuff"){const a=new h({prompt:t,llm:i});return new d({llmChain:a})}if(o==="map_reduce"){const a=new h({prompt:n,llm:i}),s=new h({prompt:r,llm:i}),u=new d({llmChain:s,documentVariableName:"summaries"});return new w({llmChain:a,combineDocumentChain:u})}throw new Error(`Invalid _type: ${o}`)},g=(i,e={})=>{const{prompt:t=ee.getPrompt(i)}=e,n=new h({prompt:t,llm:i});return new d({llmChain:n})},me=(i,e={})=>{const{combineMapPrompt:t=ie.getPrompt(i),combinePrompt:n=le.getPrompt(i)}=e,r=new h({prompt:t,llm:i}),o=new h({prompt:n,llm:i}),a=new d({llmChain:o,documentVariableName:"summaries"});return new w({llmChain:r,combineDocumentChain:a})},pe=`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`,be=`Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

{context}

Question: {question}
Helpful Answer:`;class q extends m{get inputKeys(){return[this.inputKey,this.chatHistoryKey]}constructor(e){super(),Object.defineProperty(this,"k",{enumerable:!0,configurable:!0,writable:!0,value:4}),Object.defineProperty(this,"inputKey",{enumerable:!0,configurable:!0,writable:!0,value:"question"}),Object.defineProperty(this,"chatHistoryKey",{enumerable:!0,configurable:!0,writable:!0,value:"chat_history"}),Object.defineProperty(this,"outputKey",{enumerable:!0,configurable:!0,writable:!0,value:"result"}),Object.defineProperty(this,"vectorstore",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"combineDocumentsChain",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"questionGeneratorChain",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"returnSourceDocuments",{enumerable:!0,configurable:!0,writable:!0,value:!1}),this.vectorstore=e.vectorstore,this.combineDocumentsChain=e.combineDocumentsChain,this.questionGeneratorChain=e.questionGeneratorChain,this.inputKey=e.inputKey??this.inputKey,this.outputKey=e.outputKey??this.outputKey,this.k=e.k??this.k,this.returnSourceDocuments=e.returnSourceDocuments??this.returnSourceDocuments}async _call(e){if(!(this.inputKey in e))throw new Error(`Question key ${this.inputKey} not found.`);if(!(this.chatHistoryKey in e))throw new Error(`chat history key ${this.inputKey} not found.`);const t=e[this.inputKey],n=e[this.chatHistoryKey];let r=t;if(n.length>0){const u=await this.questionGeneratorChain.call({question:t,chat_history:n}),c=Object.keys(u);if(c.length===1)r=u[c[0]];else throw new Error("Return from llm chain has multiple values, only single values supported.")}const o=await this.vectorstore.similaritySearch(r,this.k),a={question:r,input_documents:o,chat_history:n},s=await this.combineDocumentsChain.call(a);return this.returnSourceDocuments?{...s,sourceDocuments:o}:s}_chainType(){return"chat-vector-db"}static async deserialize(e,t){if(!("vectorstore"in t))throw new Error("Need to pass in a vectorstore to deserialize VectorDBQAChain");const{vectorstore:n}=t,r=await b("combine_documents_chain",e),o=await b("question_generator",e);return new q({combineDocumentsChain:await m.deserialize(r),questionGeneratorChain:await h.deserialize(o),k:e.k,vectorstore:n})}serialize(){return{_type:this._chainType(),combine_documents_chain:this.combineDocumentsChain.serialize(),question_generator:this.questionGeneratorChain.serialize(),k:this.k}}static fromLLM(e,t,n={}){const{questionGeneratorTemplate:r,qaTemplate:o,...a}=n,s=y.fromTemplate(r||pe),u=y.fromTemplate(o||be),c=g(e,{prompt:u}),l=new h({prompt:s,llm:e});return new this({vectorstore:t,combineDocumentsChain:c,questionGeneratorChain:l,...a})}}class ye{constructor(e){if(Object.defineProperty(this,"chunkSize",{enumerable:!0,configurable:!0,writable:!0,value:1e3}),Object.defineProperty(this,"chunkOverlap",{enumerable:!0,configurable:!0,writable:!0,value:200}),this.chunkSize=e?.chunkSize??this.chunkSize,this.chunkOverlap=e?.chunkOverlap??this.chunkOverlap,this.chunkOverlap>=this.chunkSize)throw new Error("Cannot have chunkOverlap >= chunkSize")}async createDocuments(e,t=[]){const n=t.length>0?t:new Array(e.length).fill({}),r=new Array;for(let o=0;o<e.length;o+=1){const a=e[o];for(const s of await this.splitText(a))r.push(new B({pageContent:s,metadata:n[o]}))}return r}async splitDocuments(e){const t=e.map(r=>r.pageContent),n=e.map(r=>r.metadata);return this.createDocuments(t,n)}joinDocs(e,t){const n=e.join(t).trim();return n===""?null:n}mergeSplits(e,t){const n=[],r=[];let o=0;for(const s of e){const u=s.length;if(o+u>=this.chunkSize&&(o>this.chunkSize&&console.warn(`Created a chunk of size ${o}, +
which is longer than the specified ${this.chunkSize}`),r.length>0)){const c=this.joinDocs(r,t);for(c!==null&&n.push(c);o>this.chunkOverlap||o+u>this.chunkSize&&o>0;)o-=r[0].length,r.shift()}r.push(s),o+=u}const a=this.joinDocs(r,t);return a!==null&&n.push(a),n}}class de extends ye{constructor(e){super(e),Object.defineProperty(this,"separators",{enumerable:!0,configurable:!0,writable:!0,value:[`

`,`
`," ",""]}),this.separators=e?.separators??this.separators}async splitText(e){const t=[];let n=this.separators[this.separators.length-1];for(const a of this.separators){if(a===""){n=a;break}if(e.includes(a)){n=a;break}}let r;n?r=e.split(n):r=e.split("");let o=[];for(const a of r)if(a.length<this.chunkSize)o.push(a);else{if(o.length){const u=this.mergeSplits(o,n);t.push(...u),o=[]}const s=await this.splitText(a);t.push(...s)}if(o.length){const a=this.mergeSplits(o,n);t.push(...a)}return t}}class E extends m{constructor(e){super(),Object.defineProperty(this,"inputKey",{enumerable:!0,configurable:!0,writable:!0,value:"input_document"}),Object.defineProperty(this,"outputKey",{enumerable:!0,configurable:!0,writable:!0,value:"output_text"}),Object.defineProperty(this,"combineDocumentsChain",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"textSplitter",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),this.combineDocumentsChain=e.combineDocumentsChain,this.inputKey=e.inputKey??this.inputKey,this.outputKey=e.outputKey??this.outputKey,this.textSplitter=e.textSplitter??new de}get inputKeys(){return[this.inputKey]}async _call(e){if(!(this.inputKey in e))throw new Error(`Document key ${this.inputKey} not found.`);const{[this.inputKey]:t,...n}=e,r=t,a={input_documents:await this.textSplitter.createDocuments([r]),...n};return await this.combineDocumentsChain.call(a)}_chainType(){return"analyze_document_chain"}static async deserialize(e,t){if(!("text_splitter"in t))throw new Error("Need to pass in a text_splitter to deserialize AnalyzeDocumentChain.");const{text_splitter:n}=t,r=await b("combine_document_chain",e);return new E({combineDocumentsChain:await m.deserialize(r),textSplitter:n})}serialize(){return{_type:this._chainType(),combine_document_chain:this.combineDocumentsChain.serialize()}}}class I extends m{get inputKeys(){return[this.inputKey]}constructor(e){super(),Object.defineProperty(this,"k",{enumerable:!0,configurable:!0,writable:!0,value:4}),Object.defineProperty(this,"inputKey",{enumerable:!0,configurable:!0,writable:!0,value:"query"}),Object.defineProperty(this,"outputKey",{enumerable:!0,configurable:!0,writable:!0,value:"result"}),Object.defineProperty(this,"vectorstore",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"combineDocumentsChain",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"returnSourceDocuments",{enumerable:!0,configurable:!0,writable:!0,value:!1}),this.vectorstore=e.vectorstore,this.combineDocumentsChain=e.combineDocumentsChain,this.inputKey=e.inputKey??this.inputKey,this.outputKey=e.outputKey??this.outputKey,this.k=e.k??this.k,this.returnSourceDocuments=e.returnSourceDocuments??this.returnSourceDocuments}async _call(e){if(!(this.inputKey in e))throw new Error(`Question key ${this.inputKey} not found.`);const t=e[this.inputKey],n=await this.vectorstore.similaritySearch(t,this.k),r={question:t,input_documents:n},o=await this.combineDocumentsChain.call(r);return this.returnSourceDocuments?{...o,sourceDocuments:n}:o}_chainType(){return"vector_db_qa"}static async deserialize(e,t){if(!("vectorstore"in t))throw new Error("Need to pass in a vectorstore to deserialize VectorDBQAChain");const{vectorstore:n}=t,r=await b("combine_documents_chain",e);return new I({combineDocumentsChain:await m.deserialize(r),k:e.k,vectorstore:n})}serialize(){return{_type:this._chainType(),combine_documents_chain:this.combineDocumentsChain.serialize(),k:this.k}}static fromLLM(e,t,n){const r=g(e);return new this({vectorstore:t,combineDocumentsChain:r,...n})}}const R=async(i,e,t={})=>{const n=U(i,e);return m.deserialize(n,t)},fe=async(i,e={})=>{const t=await W(i,R,"chains",new Set(["json","yaml"]),e);return t||$(i,R,e)},we=`Write a concise summary of the following:


"{text}"


CONCISE SUMMARY:`,K=new y({template:we,inputVariables:["text"]}),ge=(i,e={})=>{const{prompt:t=K,combineMapPrompt:n=K,combinePrompt:r=K,type:o="map_reduce"}=e;if(o==="stuff"){const a=new h({prompt:t,llm:i});return new d({llmChain:a,documentVariableName:"text"})}if(o==="map_reduce"){const a=new h({prompt:n,llm:i}),s=new h({prompt:r,llm:i}),u=new d({llmChain:s,documentVariableName:"text"});return new w({llmChain:a,combineDocumentChain:u,documentVariableName:"text"})}throw new Error(`Invalid _type: ${o}`)},ve=new y({template:`Given an input question, first create a syntactically correct {dialect} query to run, then look at the results of the query and return the answer. Unless the user specifies in his question a specific number of examples he wishes to obtain, always limit your query to at most {top_k} results. You can order the results by a relevant column to return the most interesting examples in the database.

Never query for all the columns from a specific table, only ask for a the few relevant columns given the question.

Pay attention to use only the column names that you can see in the schema description. Be careful to not query for columns that do not exist. Also, pay attention to which column is in which table.

Use the following format:

Question: "Question here"
SQLQuery: "SQL Query to run"
SQLResult: "Result of the SQLQuery"
Answer: "Final answer here"

Only use the tables listed below.

{table_info}

Question: {input}`,inputVariables:["dialect","table_info","input","top_k"]}),k=(i,e,t)=>{const n=i.map(r=>r.tableName);if(e.length>0){for(const r of e)if(!n.includes(r))throw new Error(`${t} the table ${r} was not found in the database`)}},Ce=(i,e)=>{k(i,e,"Include tables not found in database:")},_e=(i,e)=>{k(i,e,"Ignore tables not found in database:")},A=i=>{const e=[];for(const t of i){const n={columnName:t.column_name,dataType:t.data_type,isNullable:t.is_nullable==="YES"},r=e.find(o=>o.tableName===t.table_name);if(r)r.columns.push(n);else{const o={tableName:t.table_name,columns:[n]};e.push(o)}}return e},Te=async i=>{let e;if(i.options.type==="postgres"){e=`SELECT
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
    c.ordinal_position;`;const t=await i.query(e);return A(t)}if(i.options.type==="sqlite"){e=`SELECT 
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
`;const t=await i.query(e);return A(t)}if(i.options.type==="mysql"){e=`SELECT TABLE_NAME AS table_name, COLUMN_NAME AS column_name, DATA_TYPE AS data_type, IS_NULLABLE AS is_nullable FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '${i.options.database}';`;const t=await i.query(e);return A(t)}throw new Error("Database type not implemented yet")},Oe=i=>{if(!i||!Array.isArray(i)||i.length===0)return"";let e="";for(const t of i)e+=`${Object.values(t).reduce((n,r)=>`${n} ${r}`,"")}
`;return e},De=async(i,e,t)=>{if(!i)return"";let n="";for(const r of i){let o=`CREATE TABLE ${r.tableName} (
`;for(const[c,l]of r.columns.entries())c>0&&(o+=", "),o+=`${l.columnName} ${l.dataType} ${l.isNullable?"":"NOT NULL"}`;o+=`) 
`;let a;e.options.type==="mysql"?a=`SELECT * FROM \`${r.tableName}\` LIMIT ${t};
`:a=`SELECT * FROM "${r.tableName}" LIMIT ${t};
`;const s=`${r.columns.reduce((c,l)=>`${c} ${l.columnName}`,"")}
`;let u="";try{const c=await e.query(a);u=Oe(c)}catch(c){console.log(c)}n=n.concat(o+a+s+u)}return n};class v{constructor(e){if(Object.defineProperty(this,"appDataSourceOptions",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"appDataSource",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"allTables",{enumerable:!0,configurable:!0,writable:!0,value:[]}),Object.defineProperty(this,"includesTables",{enumerable:!0,configurable:!0,writable:!0,value:[]}),Object.defineProperty(this,"ignoreTables",{enumerable:!0,configurable:!0,writable:!0,value:[]}),Object.defineProperty(this,"sampleRowsInTableInfo",{enumerable:!0,configurable:!0,writable:!0,value:3}),this.appDataSource=e.appDataSource,this.appDataSourceOptions=e.appDataSource.options,e?.includesTables&&e?.ignoreTables)throw new Error("Cannot specify both include_tables and ignoreTables");this.includesTables=e?.includesTables??[],this.ignoreTables=e?.ignoreTables??[],this.sampleRowsInTableInfo=e?.sampleRowsInTableInfo??this.sampleRowsInTableInfo}static async fromDataSourceParams(e){const t=new v(e);return t.appDataSource.isInitialized||await t.appDataSource.initialize(),t.allTables=await Te(t.appDataSource),Ce(t.allTables,t.includesTables),_e(t.allTables,t.ignoreTables),t}static async fromOptionsParams(e){const{DataSource:t}=await import("typeorm"),n=new t(e.appDataSourceOptions);return v.fromDataSourceParams({...e,appDataSource:n})}async getTableInfo(e){let t=this.allTables;return e&&e.length>0&&(k(this.allTables,e,"Wrong target table name:"),t=this.allTables.filter(n=>e.includes(n.tableName))),De(t,this.appDataSource,this.sampleRowsInTableInfo)}async run(e,t="all"){const n=await this.appDataSource.query(e);return t==="all"?JSON.stringify(n):n?.length>0?JSON.stringify(n[0]):""}serialize(){return{_type:"sql_database",appDataSourceOptions:this.appDataSourceOptions,includesTables:this.includesTables,ignoreTables:this.ignoreTables,sampleRowsInTableInfo:this.sampleRowsInTableInfo}}static async imports(){try{const{DataSource:e}=await import("typeorm");return{DataSource:e}}catch(e){throw console.error(e),new Error("Failed to load typeorm. Please install it with eg. `yarn add typeorm`.")}}}class N extends m{constructor(e){const{memory:t}=e;super(t),Object.defineProperty(this,"llm",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"database",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"prompt",{enumerable:!0,configurable:!0,writable:!0,value:ve}),Object.defineProperty(this,"topK",{enumerable:!0,configurable:!0,writable:!0,value:5}),Object.defineProperty(this,"inputKey",{enumerable:!0,configurable:!0,writable:!0,value:"query"}),Object.defineProperty(this,"outputKey",{enumerable:!0,configurable:!0,writable:!0,value:"result"}),Object.defineProperty(this,"returnDirect",{enumerable:!0,configurable:!0,writable:!0,value:!1}),this.llm=e.llm,this.database=e.database,this.inputKey=e.inputKey??this.inputKey,this.outputKey=e.outputKey??this.outputKey}async _call(e){const t=new h({prompt:this.prompt,llm:this.llm,outputKey:this.outputKey,memory:this.memory});if(!(this.inputKey in e))throw new Error(`Question key ${this.inputKey} not found.`);let r=`${e[this.inputKey]}
SQLQuery:`;const o=e.table_names_to_use,a=await this.database.getTableInfo(o),s={input:r,top_k:this.topK,dialect:this.database.appDataSourceOptions.type,table_info:a,stop:[`
SQLResult:`]},u=[],c=await t.predict(s);u.push(c);let l="";try{l=await this.database.appDataSource.query(c),u.push(l)}catch(C){console.error(C)}let p;return this.returnDirect?p={result:l}:(r+=`${+c}
SQLResult: ${JSON.stringify(l)}
Answer:`,s.input=r,p={result:await t.predict(s)}),p}_chainType(){return"sql_database_chain"}get inputKeys(){return[this.inputKey]}static async deserialize(e){const t=await b("llm",e),n=await F.deserialize(t),r=await b("sql_database",e),o=await v.fromOptionsParams(r);return new N({llm:n,database:o})}serialize(){return{_type:this._chainType(),llm:this.llm.serialize(),sql_database:this.database.serialize()}}}const Se=`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`,Pe=`Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

{context}

Question: {question}
Helpful Answer:`;class Ke extends m{get inputKeys(){return[this.inputKey,this.chatHistoryKey]}constructor(e){super(),Object.defineProperty(this,"inputKey",{enumerable:!0,configurable:!0,writable:!0,value:"question"}),Object.defineProperty(this,"chatHistoryKey",{enumerable:!0,configurable:!0,writable:!0,value:"chat_history"}),Object.defineProperty(this,"outputKey",{enumerable:!0,configurable:!0,writable:!0,value:"result"}),Object.defineProperty(this,"retriever",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"combineDocumentsChain",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"questionGeneratorChain",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"returnSourceDocuments",{enumerable:!0,configurable:!0,writable:!0,value:!1}),this.retriever=e.retriever,this.combineDocumentsChain=e.combineDocumentsChain,this.questionGeneratorChain=e.questionGeneratorChain,this.inputKey=e.inputKey??this.inputKey,this.outputKey=e.outputKey??this.outputKey,this.returnSourceDocuments=e.returnSourceDocuments??this.returnSourceDocuments}async _call(e){if(!(this.inputKey in e))throw new Error(`Question key ${this.inputKey} not found.`);if(!(this.chatHistoryKey in e))throw new Error(`chat history key ${this.inputKey} not found.`);const t=e[this.inputKey],n=e[this.chatHistoryKey];let r=t;if(n.length>0){const u=await this.questionGeneratorChain.call({question:t,chat_history:n}),c=Object.keys(u);if(c.length===1)r=u[c[0]];else throw new Error("Return from llm chain has multiple values, only single values supported.")}const o=await this.retriever.getRelevantDocuments(r),a={question:r,input_documents:o,chat_history:n},s=await this.combineDocumentsChain.call(a);return this.returnSourceDocuments?{...s,sourceDocuments:o}:s}_chainType(){return"conversational_retrieval_chain"}static async deserialize(e,t){throw new Error("Not implemented.")}serialize(){throw new Error("Not implemented.")}static fromLLM(e,t,n={}){const{questionGeneratorTemplate:r,qaTemplate:o,...a}=n,s=y.fromTemplate(r||Se),u=y.fromTemplate(o||Pe),c=g(e,{prompt:u}),l=new h({prompt:s,llm:e});return new this({retriever:t,combineDocumentsChain:c,questionGeneratorChain:l,...a})}}class ke extends m{get inputKeys(){return[this.inputKey]}constructor(e){super(),Object.defineProperty(this,"inputKey",{enumerable:!0,configurable:!0,writable:!0,value:"query"}),Object.defineProperty(this,"outputKey",{enumerable:!0,configurable:!0,writable:!0,value:"result"}),Object.defineProperty(this,"retriever",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"combineDocumentsChain",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"returnSourceDocuments",{enumerable:!0,configurable:!0,writable:!0,value:!1}),this.retriever=e.retriever,this.combineDocumentsChain=e.combineDocumentsChain,this.inputKey=e.inputKey??this.inputKey,this.outputKey=e.outputKey??this.outputKey,this.returnSourceDocuments=e.returnSourceDocuments??this.returnSourceDocuments}async _call(e){if(!(this.inputKey in e))throw new Error(`Question key ${this.inputKey} not found.`);const t=e[this.inputKey],n=await this.retriever.getRelevantDocuments(t),r={question:t,input_documents:n},o=await this.combineDocumentsChain.call(r);return this.returnSourceDocuments?{...o,sourceDocuments:n}:o}_chainType(){return"retrieval_qa"}static async deserialize(e,t){throw new Error("Not implemented")}serialize(){throw new Error("Not implemented")}static fromLLM(e,t,n){const r=g(e);return new this({retriever:t,combineDocumentsChain:r,...n})}}export{E as AnalyzeDocumentChain,m as BaseChain,q as ChatVectorDBQAChain,Ke as ConversationalRetrievalQAChain,h as LLMChain,w as MapReduceDocumentsChain,ke as RetrievalQAChain,N as SqlDatabaseChain,d as StuffDocumentsChain,I as VectorDBQAChain,fe as loadChain,he as loadQAChain,me as loadQAMapReduceChain,g as loadQAStuffChain,ge as loadSummarizationChain};
