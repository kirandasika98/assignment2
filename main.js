import AssistantV1 from 'watson-developer-cloud/assistant/v1';

// assistant is a global variable that holds the state for the watson
// service api
let assistant;
// workspaceId will be initialized when the cloud function is invoked
let workspaceId = "";

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

  // initialize the workspace id
  workspaceId = args.WORKSPACE_ID;
};

let handleResponse = (watsonResponse) => {
    console.log('sending response ' + response);
    let alexaResponse;
    if (watsonResponse.output.text.length > 0) {
        // assign the first value in the array as our alexa response
        alexaResponse = watsonResponse.output.text[0];
    }
    return { 
        version: '1.0',
        response: {
            shouldEndSession: false,
            outputSpeech: {
                type: 'PlainText',
                text: alexaResponse 
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


let main = (args) => {
    console.log('Begin action');
    return new Promise((resolve, reject) => {
        if (!args.__ow_body){
            return reject(errResponse('must be called from alexa'));
        }

        // decode body from payload and convert to ascii
        const rawBody = Buffer.from(args.__ow_body, 'base64').toString('ascii');
        const body = JSON.parse(rawBody);
        const request = body.request;

        initClients(args)
        .then(() => handleRequest(request))
        .then((response) => handleResponse(response))
    });
};

const _main = main;
export { _main as main };
