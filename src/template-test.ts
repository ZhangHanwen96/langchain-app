import {  renderTemplate  } from "langchain/prompts"



const template = `
{{ 
    "$schema": "https://json-schema.org/draft/2019-09/schema",
    "type": "array",
    "title": "Arguments",
    "description": "javascript function arguments array",
    "items": [
      {{ 
        "type": "object",
        "required": ["contactId", "message"],
        "properties": {{ 
          "contactId": {{ 
            "type": "string",
            "title": "contact ID",
            "description": "The unique ID of a contact"
           }},
          "message": {{ 
            "type": "string",
            "title": "message",
            "description": "The message to send to contact"
           }}
         }},
       }}
    ]
   }}

{desc}
`

console.log(renderTemplate(template, 'f-string', {
    desc: 'haahha'
 }))