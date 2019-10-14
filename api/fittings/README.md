## Bagpipes and Fittings
```
Bagpipes was developed as a way to enable API flows and mashups to be created 
declaratively in YAML (or JSON) without writing code. It works a lot like 
functional programming... there's no global state, data is just passed from 
one function to the next down the line until we're done. (Similar to connect
middleware.)
```
[Full docs](https://github.com/apigee-127/bagpipes)

### Creating a fitting
1. Create a file in this directory and call it the name of your fitting (i.e. `logger`,`auth`)
2. In it, copy the following template
    ```
    module.exports = function create(fittingDef, bagpipes) {
      return function YOUR_FITTING_NAME({ request, response }, next) {
        // write the logic here..
      };
    };
    ```
3. To assign it to an existing bagpipe, just go into `/config/default.yaml` under the property `swagger.bagpipes`.
    
    i.e. if you want your fitting to be called before swagger security middleware of every request,
    go to `swagger.bagpipes.swagger_controllers` and put the name of your pipe before the `swagger_security` fitting
    
    if you want your fitting to be called on a specific request, create your own bagpipe for it (chapter below)
    
 ### Creating a Bagpipe
 A bagpipe is a collection of fittings, ordered for execution. The default pipe that every request goes through is called `swagger_controllers`.
 
 If you want to create your own bagpipe, create another property with the name of your pipe that contains an array of fittings you want to be called.
 
 To call your custom bagpipe on a specific request, go to the swagger definition of the endpoint you would like to change the pipe, and use the property `x-swagger-pipe: YOUR_PIPE_NAME`.
 
 For example, to do a logger pipe, you need your bagpipe to call your logger fitting, and than to the normal `swagger_controllers`.
