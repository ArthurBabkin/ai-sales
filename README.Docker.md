### Building and running your application

To build an docker image of an application, from working directory run:
`docker build -t ai-sales.`.

App will be running on http://localhost:8000.

### Running application

Once image is build, run it:
`docker run --name ai-sales-container ai-sales`

Consult Docker's [getting started](https://docs.docker.com/go/get-started-sharing/)
docs for more detail on building and pushing.

### References
* [Docker's Node.js guide](https://docs.docker.com/language/nodejs/)