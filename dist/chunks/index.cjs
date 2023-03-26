"use strict";const app=require("../shared/langchainjs.c7ba910b.cjs");require("path"),require("tty"),require("util"),require("fs"),require("net"),require("events"),require("stream"),require("zlib"),require("buffer"),require("string_decoder"),require("querystring"),require("url"),require("http"),require("crypto"),require("os"),require("https"),require("assert"),require("node:fs/promises"),require("node:path");const HUB_PATH_REGEX=/lc(@[^:]+)?:\/\/(.*)/,URL_PATH_SEPARATOR="/",loadFromHub=async(a,e,t,n,r={})=>{const i=a.match(HUB_PATH_REGEX);if(!i)return;const[s,o]=i.slice(1),l=s?s.slice(1):process.env.LANGCHAIN_HUB_DEFAULT_REF??"master";if(o.split(URL_PATH_SEPARATOR)[0]!==t)return;if(!n.has(app.extname(o).slice(1)))throw new Error("Unsupported file type.");const c=[process.env.LANGCHAIN_HUB_URL_BASE??"https://raw.githubusercontent.com/hwchase17/langchain-hub/",l,o].join("/"),h=await app.fetchWithTimeout(c,{timeout:5e3});if(h.status!==200)throw new Error(`Could not find file at ${c}`);return e(await h.text(),o,r)},question_generator_template$1=`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`,qa_template$1=`Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

{context}

Question: {question}
Helpful Answer:`;class ChatVectorDBQAChain extends app.BaseChain{get inputKeys(){return[this.inputKey,this.chatHistoryKey]}constructor(e){super(),Object.defineProperty(this,"k",{enumerable:!0,configurable:!0,writable:!0,value:4}),Object.defineProperty(this,"inputKey",{enumerable:!0,configurable:!0,writable:!0,value:"question"}),Object.defineProperty(this,"chatHistoryKey",{enumerable:!0,configurable:!0,writable:!0,value:"chat_history"}),Object.defineProperty(this,"outputKey",{enumerable:!0,configurable:!0,writable:!0,value:"result"}),Object.defineProperty(this,"vectorstore",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"combineDocumentsChain",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"questionGeneratorChain",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"returnSourceDocuments",{enumerable:!0,configurable:!0,writable:!0,value:!1}),this.vectorstore=e.vectorstore,this.combineDocumentsChain=e.combineDocumentsChain,this.questionGeneratorChain=e.questionGeneratorChain,this.inputKey=e.inputKey??this.inputKey,this.outputKey=e.outputKey??this.outputKey,this.k=e.k??this.k,this.returnSourceDocuments=e.returnSourceDocuments??this.returnSourceDocuments}async _call(e){if(!(this.inputKey in e))throw new Error(`Question key ${this.inputKey} not found.`);if(!(this.chatHistoryKey in e))throw new Error(`chat history key ${this.inputKey} not found.`);const t=e[this.inputKey],n=e[this.chatHistoryKey];let r=t;if(n.length>0){const l=await this.questionGeneratorChain.call({question:t,chat_history:n}),u=Object.keys(l);if(u.length===1)r=l[u[0]];else throw new Error("Return from llm chain has multiple values, only single values supported.")}const i=await this.vectorstore.similaritySearch(r,this.k),s={question:r,input_documents:i,chat_history:n},o=await this.combineDocumentsChain.call(s);return this.returnSourceDocuments?{...o,sourceDocuments:i}:o}_chainType(){return"chat-vector-db"}static async deserialize(e,t){if(!("vectorstore"in t))throw new Error("Need to pass in a vectorstore to deserialize VectorDBQAChain");const{vectorstore:n}=t,r=await app.resolveConfigFromFile("combine_documents_chain",e),i=await app.resolveConfigFromFile("question_generator",e);return new ChatVectorDBQAChain({combineDocumentsChain:await app.BaseChain.deserialize(r),questionGeneratorChain:await app.LLMChain.deserialize(i),k:e.k,vectorstore:n})}serialize(){return{_type:this._chainType(),combine_documents_chain:this.combineDocumentsChain.serialize(),question_generator:this.questionGeneratorChain.serialize(),k:this.k}}static fromLLM(e,t,n={}){const{questionGeneratorTemplate:r,qaTemplate:i,...s}=n,o=app.PromptTemplate.fromTemplate(r||question_generator_template$1),l=app.PromptTemplate.fromTemplate(i||qa_template$1),u=app.loadQAStuffChain(e,{prompt:l}),c=new app.LLMChain({prompt:o,llm:e});return new this({vectorstore:t,combineDocumentsChain:u,questionGeneratorChain:c,...s})}}class AnalyzeDocumentChain extends app.BaseChain{constructor(e){super(),Object.defineProperty(this,"inputKey",{enumerable:!0,configurable:!0,writable:!0,value:"input_document"}),Object.defineProperty(this,"outputKey",{enumerable:!0,configurable:!0,writable:!0,value:"output_text"}),Object.defineProperty(this,"combineDocumentsChain",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"textSplitter",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),this.combineDocumentsChain=e.combineDocumentsChain,this.inputKey=e.inputKey??this.inputKey,this.outputKey=e.outputKey??this.outputKey,this.textSplitter=e.textSplitter??new app.RecursiveCharacterTextSplitter}get inputKeys(){return[this.inputKey]}async _call(e){if(!(this.inputKey in e))throw new Error(`Document key ${this.inputKey} not found.`);const{[this.inputKey]:t,...n}=e,r=t,s={input_documents:await this.textSplitter.createDocuments([r]),...n};return await this.combineDocumentsChain.call(s)}_chainType(){return"analyze_document_chain"}static async deserialize(e,t){if(!("text_splitter"in t))throw new Error("Need to pass in a text_splitter to deserialize AnalyzeDocumentChain.");const{text_splitter:n}=t,r=await app.resolveConfigFromFile("combine_document_chain",e);return new AnalyzeDocumentChain({combineDocumentsChain:await app.BaseChain.deserialize(r),textSplitter:n})}serialize(){return{_type:this._chainType(),combine_document_chain:this.combineDocumentsChain.serialize()}}}const loadChainFromFile=async(a,e,t={})=>{const n=app.parseFileConfig(a,e);return app.BaseChain.deserialize(n,t)},loadChain=async(a,e={})=>{const t=await loadFromHub(a,loadChainFromFile,"chains",new Set(["json","yaml"]),e);return t||app.loadFromFile(a,loadChainFromFile,e)},template=`Write a concise summary of the following:


"{text}"


CONCISE SUMMARY:`,DEFAULT_PROMPT=new app.PromptTemplate({template,inputVariables:["text"]}),loadSummarizationChain=(a,e={})=>{const{prompt:t=DEFAULT_PROMPT,combineMapPrompt:n=DEFAULT_PROMPT,combinePrompt:r=DEFAULT_PROMPT,type:i="map_reduce"}=e;if(i==="stuff"){const s=new app.LLMChain({prompt:t,llm:a});return new app.StuffDocumentsChain({llmChain:s,documentVariableName:"text"})}if(i==="map_reduce"){const s=new app.LLMChain({prompt:n,llm:a}),o=new app.LLMChain({prompt:r,llm:a}),l=new app.StuffDocumentsChain({llmChain:o,documentVariableName:"text"});return new app.MapReduceDocumentsChain({llmChain:s,combineDocumentChain:l,documentVariableName:"text"})}throw new Error(`Invalid _type: ${i}`)},DEFAULT_SQL_DATABASE_PROMPT=new app.PromptTemplate({template:`Given an input question, first create a syntactically correct {dialect} query to run, then look at the results of the query and return the answer. Unless the user specifies in his question a specific number of examples he wishes to obtain, always limit your query to at most {top_k} results. You can order the results by a relevant column to return the most interesting examples in the database.

Never query for all the columns from a specific table, only ask for a the few relevant columns given the question.

Pay attention to use only the column names that you can see in the schema description. Be careful to not query for columns that do not exist. Also, pay attention to which column is in which table.

Use the following format:

Question: "Question here"
SQLQuery: "SQL Query to run"
SQLResult: "Result of the SQLQuery"
Answer: "Final answer here"

Only use the tables listed below.

{table_info}

Question: {input}`,inputVariables:["dialect","table_info","input","top_k"]}),verifyListTablesExistInDatabase=(a,e,t)=>{const n=a.map(r=>r.tableName);if(e.length>0){for(const r of e)if(!n.includes(r))throw new Error(`${t} the table ${r} was not found in the database`)}},verifyIncludeTablesExistInDatabase=(a,e)=>{verifyListTablesExistInDatabase(a,e,"Include tables not found in database:")},verifyIgnoreTablesExistInDatabase=(a,e)=>{verifyListTablesExistInDatabase(a,e,"Ignore tables not found in database:")},formatToSqlTable=a=>{const e=[];for(const t of a){const n={columnName:t.column_name,dataType:t.data_type,isNullable:t.is_nullable==="YES"},r=e.find(i=>i.tableName===t.table_name);if(r)r.columns.push(n);else{const i={tableName:t.table_name,columns:[n]};e.push(i)}}return e},getTableAndColumnsName=async a=>{let e;if(a.options.type==="postgres"){e=`SELECT
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
    c.ordinal_position;`;const t=await a.query(e);return formatToSqlTable(t)}if(a.options.type==="sqlite"){e=`SELECT 
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
`;const t=await a.query(e);return formatToSqlTable(t)}if(a.options.type==="mysql"){e=`SELECT TABLE_NAME AS table_name, COLUMN_NAME AS column_name, DATA_TYPE AS data_type, IS_NULLABLE AS is_nullable FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '${a.options.database}';`;const t=await a.query(e);return formatToSqlTable(t)}throw new Error("Database type not implemented yet")},formatSqlResponseToSimpleTableString=a=>{if(!a||!Array.isArray(a)||a.length===0)return"";let e="";for(const t of a)e+=`${Object.values(t).reduce((n,r)=>`${n} ${r}`,"")}
`;return e},generateTableInfoFromTables=async(a,e,t)=>{if(!a)return"";let n="";for(const r of a){let i=`CREATE TABLE ${r.tableName} (
`;for(const[u,c]of r.columns.entries())u>0&&(i+=", "),i+=`${c.columnName} ${c.dataType} ${c.isNullable?"":"NOT NULL"}`;i+=`) 
`;let s;e.options.type==="mysql"?s=`SELECT * FROM \`${r.tableName}\` LIMIT ${t};
`:s=`SELECT * FROM "${r.tableName}" LIMIT ${t};
`;const o=`${r.columns.reduce((u,c)=>`${u} ${c.columnName}`,"")}
`;let l="";try{const u=await e.query(s);l=formatSqlResponseToSimpleTableString(u)}catch(u){console.log(u)}n=n.concat(i+s+o+l)}return n};class SqlDatabase{constructor(e){if(Object.defineProperty(this,"appDataSourceOptions",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"appDataSource",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"allTables",{enumerable:!0,configurable:!0,writable:!0,value:[]}),Object.defineProperty(this,"includesTables",{enumerable:!0,configurable:!0,writable:!0,value:[]}),Object.defineProperty(this,"ignoreTables",{enumerable:!0,configurable:!0,writable:!0,value:[]}),Object.defineProperty(this,"sampleRowsInTableInfo",{enumerable:!0,configurable:!0,writable:!0,value:3}),this.appDataSource=e.appDataSource,this.appDataSourceOptions=e.appDataSource.options,e?.includesTables&&e?.ignoreTables)throw new Error("Cannot specify both include_tables and ignoreTables");this.includesTables=e?.includesTables??[],this.ignoreTables=e?.ignoreTables??[],this.sampleRowsInTableInfo=e?.sampleRowsInTableInfo??this.sampleRowsInTableInfo}static async fromDataSourceParams(e){const t=new SqlDatabase(e);return t.appDataSource.isInitialized||await t.appDataSource.initialize(),t.allTables=await getTableAndColumnsName(t.appDataSource),verifyIncludeTablesExistInDatabase(t.allTables,t.includesTables),verifyIgnoreTablesExistInDatabase(t.allTables,t.ignoreTables),t}static async fromOptionsParams(e){const{DataSource:t}=await import("typeorm"),n=new t(e.appDataSourceOptions);return SqlDatabase.fromDataSourceParams({...e,appDataSource:n})}async getTableInfo(e){let t=this.allTables;return e&&e.length>0&&(verifyListTablesExistInDatabase(this.allTables,e,"Wrong target table name:"),t=this.allTables.filter(n=>e.includes(n.tableName))),generateTableInfoFromTables(t,this.appDataSource,this.sampleRowsInTableInfo)}async run(e,t="all"){const n=await this.appDataSource.query(e);return t==="all"?JSON.stringify(n):n?.length>0?JSON.stringify(n[0]):""}serialize(){return{_type:"sql_database",appDataSourceOptions:this.appDataSourceOptions,includesTables:this.includesTables,ignoreTables:this.ignoreTables,sampleRowsInTableInfo:this.sampleRowsInTableInfo}}static async imports(){try{const{DataSource:e}=await import("typeorm");return{DataSource:e}}catch(e){throw console.error(e),new Error("Failed to load typeorm. Please install it with eg. `yarn add typeorm`.")}}}class SqlDatabaseChain extends app.BaseChain{constructor(e){const{memory:t}=e;super(t),Object.defineProperty(this,"llm",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"database",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"prompt",{enumerable:!0,configurable:!0,writable:!0,value:DEFAULT_SQL_DATABASE_PROMPT}),Object.defineProperty(this,"topK",{enumerable:!0,configurable:!0,writable:!0,value:5}),Object.defineProperty(this,"inputKey",{enumerable:!0,configurable:!0,writable:!0,value:"query"}),Object.defineProperty(this,"outputKey",{enumerable:!0,configurable:!0,writable:!0,value:"result"}),Object.defineProperty(this,"returnDirect",{enumerable:!0,configurable:!0,writable:!0,value:!1}),this.llm=e.llm,this.database=e.database,this.inputKey=e.inputKey??this.inputKey,this.outputKey=e.outputKey??this.outputKey}async _call(e){const t=new app.LLMChain({prompt:this.prompt,llm:this.llm,outputKey:this.outputKey,memory:this.memory});if(!(this.inputKey in e))throw new Error(`Question key ${this.inputKey} not found.`);let r=`${e[this.inputKey]}
SQLQuery:`;const i=e.table_names_to_use,s=await this.database.getTableInfo(i),o={input:r,top_k:this.topK,dialect:this.database.appDataSourceOptions.type,table_info:s,stop:[`
SQLResult:`]},l=[],u=await t.predict(o);l.push(u);let c="";try{c=await this.database.appDataSource.query(u),l.push(c)}catch(p){console.error(p)}let h;return this.returnDirect?h={result:c}:(r+=`${+u}
SQLResult: ${JSON.stringify(c)}
Answer:`,o.input=r,h={result:await t.predict(o)}),h}_chainType(){return"sql_database_chain"}get inputKeys(){return[this.inputKey]}static async deserialize(e){const t=await app.resolveConfigFromFile("llm",e),n=await app.BaseLanguageModel.deserialize(t),r=await app.resolveConfigFromFile("sql_database",e),i=await SqlDatabase.fromOptionsParams(r);return new SqlDatabaseChain({llm:n,database:i})}serialize(){return{_type:this._chainType(),llm:this.llm.serialize(),sql_database:this.database.serialize()}}}const question_generator_template=`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`,qa_template=`Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

{context}

Question: {question}
Helpful Answer:`;class ConversationalRetrievalQAChain extends app.BaseChain{get inputKeys(){return[this.inputKey,this.chatHistoryKey]}constructor(e){super(),Object.defineProperty(this,"inputKey",{enumerable:!0,configurable:!0,writable:!0,value:"question"}),Object.defineProperty(this,"chatHistoryKey",{enumerable:!0,configurable:!0,writable:!0,value:"chat_history"}),Object.defineProperty(this,"outputKey",{enumerable:!0,configurable:!0,writable:!0,value:"result"}),Object.defineProperty(this,"retriever",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"combineDocumentsChain",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"questionGeneratorChain",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"returnSourceDocuments",{enumerable:!0,configurable:!0,writable:!0,value:!1}),this.retriever=e.retriever,this.combineDocumentsChain=e.combineDocumentsChain,this.questionGeneratorChain=e.questionGeneratorChain,this.inputKey=e.inputKey??this.inputKey,this.outputKey=e.outputKey??this.outputKey,this.returnSourceDocuments=e.returnSourceDocuments??this.returnSourceDocuments}async _call(e){if(!(this.inputKey in e))throw new Error(`Question key ${this.inputKey} not found.`);if(!(this.chatHistoryKey in e))throw new Error(`chat history key ${this.inputKey} not found.`);const t=e[this.inputKey],n=e[this.chatHistoryKey];let r=t;if(n.length>0){const l=await this.questionGeneratorChain.call({question:t,chat_history:n}),u=Object.keys(l);if(u.length===1)r=l[u[0]];else throw new Error("Return from llm chain has multiple values, only single values supported.")}const i=await this.retriever.getRelevantDocuments(r),s={question:r,input_documents:i,chat_history:n},o=await this.combineDocumentsChain.call(s);return this.returnSourceDocuments?{...o,sourceDocuments:i}:o}_chainType(){return"conversational_retrieval_chain"}static async deserialize(e,t){throw new Error("Not implemented.")}serialize(){throw new Error("Not implemented.")}static fromLLM(e,t,n={}){const{questionGeneratorTemplate:r,qaTemplate:i,...s}=n,o=app.PromptTemplate.fromTemplate(r||question_generator_template),l=app.PromptTemplate.fromTemplate(i||qa_template),u=app.loadQAStuffChain(e,{prompt:l}),c=new app.LLMChain({prompt:o,llm:e});return new this({retriever:t,combineDocumentsChain:u,questionGeneratorChain:c,...s})}}class RetrievalQAChain extends app.BaseChain{get inputKeys(){return[this.inputKey]}constructor(e){super(),Object.defineProperty(this,"inputKey",{enumerable:!0,configurable:!0,writable:!0,value:"query"}),Object.defineProperty(this,"outputKey",{enumerable:!0,configurable:!0,writable:!0,value:"result"}),Object.defineProperty(this,"retriever",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"combineDocumentsChain",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"returnSourceDocuments",{enumerable:!0,configurable:!0,writable:!0,value:!1}),this.retriever=e.retriever,this.combineDocumentsChain=e.combineDocumentsChain,this.inputKey=e.inputKey??this.inputKey,this.outputKey=e.outputKey??this.outputKey,this.returnSourceDocuments=e.returnSourceDocuments??this.returnSourceDocuments}async _call(e){if(!(this.inputKey in e))throw new Error(`Question key ${this.inputKey} not found.`);const t=e[this.inputKey],n=await this.retriever.getRelevantDocuments(t),r={question:t,input_documents:n},i=await this.combineDocumentsChain.call(r);return this.returnSourceDocuments?{...i,sourceDocuments:n}:i}_chainType(){return"retrieval_qa"}static async deserialize(e,t){throw new Error("Not implemented")}serialize(){throw new Error("Not implemented")}static fromLLM(e,t,n){const r=app.loadQAStuffChain(e);return new this({retriever:t,combineDocumentsChain:r,...n})}}exports.BaseChain=app.BaseChain,exports.ConversationChain=app.ConversationChain,exports.LLMChain=app.LLMChain,exports.MapReduceDocumentsChain=app.MapReduceDocumentsChain,exports.StuffDocumentsChain=app.StuffDocumentsChain,exports.VectorDBQAChain=app.VectorDBQAChain,exports.loadQAChain=app.loadQAChain,exports.loadQAMapReduceChain=app.loadQAMapReduceChain,exports.loadQAStuffChain=app.loadQAStuffChain,exports.AnalyzeDocumentChain=AnalyzeDocumentChain,exports.ChatVectorDBQAChain=ChatVectorDBQAChain,exports.ConversationalRetrievalQAChain=ConversationalRetrievalQAChain,exports.RetrievalQAChain=RetrievalQAChain,exports.SqlDatabaseChain=SqlDatabaseChain,exports.loadChain=loadChain,exports.loadSummarizationChain=loadSummarizationChain;
