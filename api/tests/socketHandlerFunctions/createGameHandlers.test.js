const registerCreateGameHandlers = require("../../sockets/createGameHandlers")
const handleCreateGame = require("../../sockets/handleCreateGame")
const handleJoinGame = require("../../sockets/handleJoinGame")

//mock the handler functions
jest.mock("../../sockets/handleCreateGame", ()=>jest.fn());
jest.mock("../../sockets/handleJoinGame", ()=>jest.fn());

describe("registerCreateGameHandlers", ()=>{

    let io;
    let socket;

    beforeEach(()=>{
        io = {};
        socket ={
            on: jest.fn()
        }
    })
    jest.clearAllMocks();

    
    test("game:create socket event is registered", ()=>{
        registerCreateGameHandlers(io, socket);
        //socket.on called with game:create event whose 2nd
        //  arg is an anonymous function - jest matcher .any(Function) used to
        //check a function is passed

        expect(socket.on).toHaveBeenCalledWith(
            "game:create",
            expect.any(Function)
        );

    });

    test("game:join socket event is registered", ()=>{
        registerCreateGameHandlers(io, socket);
        expect(socket.on).toHaveBeenCalledWith(
            "game:join",
            expect.any(Function)
        );

    })

    test("when game:create event is triggered handeleCreateGame is called ", async ()=>{
        
        //set up paylad and mock cb function
        const payload = {display_name: "Bob"}
        const callback = jest.fn();  //mocks socket response cb func

        //register handlers
        registerCreateGameHandlers(io, socket);

        //get handler func for event
        //mock calls [[event],[func]]
        const createGameHandler = socket.on.mock.calls.find(
            ([eventName]) => eventName === "game:create"
        )[1]

        //event firing
        await createGameHandler(payload, callback);

        expect(handleCreateGame).toHaveBeenCalledWith(
            io, socket,payload, callback
        )
    })

    test("when game:join event is triggered handeleJoinGame is called ", async ()=>{
        
        //set up paylad and mock cb function
        const payload = {display_name: "Sid"}
        const callback = jest.fn();  //mocks socket response cb func

        //register handlers
        registerCreateGameHandlers(io, socket);

        //get handler func for event
        //mock calls [[event],[func]]
        const joinGameHandler = socket.on.mock.calls.find(
            ([eventName]) => eventName === "game:join"
        )[1]

        //event firing
        await joinGameHandler(payload, callback);

        expect(handleJoinGame).toHaveBeenCalledWith(
            io, socket, payload, callback
        )
    })
});
