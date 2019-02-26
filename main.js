const AssistantV1 = require('watson-developer-cloud/assistant/v1');

let assistant;


let errResponse = (reason) => { 
    return { 
        version: '1.0',
        response: {
            shouldEndSession: true,
            outputSpeech: {
                type: 'PlainText',
                text: reason || 'An unexpected error occurred'
            }
        }
    };
};

let initClients = (args) => {
   if (args.ASSISTANT_IAM_APIKEY) {
    assistant = new AssistantV1({
      version: '2018-02-16',
      iam_apikey: args.ASSISTANT_IAM_APIKEY,
      url: args.ASSISTANT_IAM_URL
    });
  } else if (args.ASSISTANT_USERNAME) {
    assistant = new AssistantV1({
      version: '2018-02-16',
      username: args.ASSISTANT_USERNAME,
      password: args.ASSISTANT_PASSWORD
    });
  } else {
    console.error('err? ' + 'Invalid Credentials');
    throw new Error('Invalid Credentials');
  } 
};
let handleResponse = (response) => {
    console.log('sending response ' + response);
     
    return { 
        version: '1.0',
        response: {
            shouldEndSession: false,
            outputSpeech: {
                type: 'PlainText',
                text: response 
            }
        }
    };
};

let handleRequest = (request) => {
    return new Promise((resolve, reject) => {
        const input = request.intent ? request.intent.slots.EverythingSlot.value : 'start skill';
        console.log('input ' + input);
        assistant.message({
            input: { text: input },
            workspace_id: workspaceId
        }, (err, watsonResponse) => {
            resolve(watsonResponse);
        });
    });
};


let main = (args) {
    console.log('Begin action');
    return new Promise((resolve, reject) => {
        if (!args.__ow_body){
            return reject(errResponse('must be called from alexa'));
        }

        const rawBody = Buffer.from(args.__ow_body 'base64').toString('ascii');
        const body = JSON.parse(rawBody);
        const sessionId = body.session.sessionId;
        const request = body.request;
        
        initClients(args)
        .then(() => handleRequest(request))
        .then((response) => handleResponse(response))
    });
};

module.exports = main;
