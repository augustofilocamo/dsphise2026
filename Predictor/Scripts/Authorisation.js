namespace Authorisation
{
    // funciona con Engine.getSystemTime(1)
    function secondsFrom2021(dt){
        Console.print(dt);
        var date_time = dt.split("T");
        var date = date_time[0];
        date = date.split("-");
        var year = parseInt(date[0]);
        var month = parseInt(date[1]);
        var day = parseInt(date[2]);
        var time = date_time[1];
        time = time.split("-")[0];
        time = time.split(":");
        var hora = parseInt(time[0]);
        var min = parseInt(time[1]);
        var seg = parseInt(time[2]);
        seg = seg + min * 60 + hora * 60 * 60 + day * 24 * 60 * 60 + month * 30 * 24 * 60 * 60 + (year - 2021) * 12 * 30 * 24 * 60 * 60;
        Console.print(seg);
        return seg;
    }
        
        
//3EF2B848-15054205-BE896E41-ECB71F00
        
    // A cada producto editar UserPIN y productId
    const var UserPIN = "sqeiebfi98e9hdcasdKJHDSKJdlksjw988e8e8e8kjasdhkj";
    global ActivationsCount = 6;
    const var productId = "rnGoa";
    reg vStatus;

	reg machineId = FileSystem.getSystemId();
	reg currTimeSecondCheck;
	reg p2;
    reg dataToEncrypt;
    reg FileDirectory;
    reg currTimeOS;
    reg checkTime;
    reg currTimeCOL;
    global licenseKey;
    


    inline function checkOnTimer() {
        if (Server.isOnline() == 0) {
            Console.print("offline 1");
            Description.set("text", "Check your internet conection");
            setValidLicense(false);
            return;
        }
        Console.print("Checking Serial");
        SerialInput.set("text", "");

        
        //Get encrypted file/object 
        FileDirectory = FileSystem.getFolder(FileSystem.UserPresets).getParentDirectory();
        decryptedData = FileDirectory.getChildFile("RegData.js").loadEncryptedObject(UserPIN);

        if(decryptedData == false) {
            Console.print("RegData deleted or incorrect, set invalid");
            setValidLicense(false);
            return;
        }
        vStatus = decryptedData.OuathReg;
        licenseKey = decryptedData.licenseKey;
        Console.print("Restored serial: " + vStatus);
        Console.print("License key: " + licenseKey);


        

        if(vStatus == FileSystem.getSystemId()) {
             currTimeSecondCheck = secondsFrom2021(Engine.getSystemTime(1));
             p2 = {
                "licenseKey": licenseKey,
                "productId": productId,
                "currTime": currTimeSecondCheck,
                "checkTime": decryptedData.checkTime
            };
            
            // Segundo chequeo de licencia con el servidor
            reg r2;
            Server.setBaseURL("https://308service.com");
            Server.callWithPOST("/api/v1/licenses/validations", p2, function(status, response) {
                r2 = response;
            
                global serverStatus = status;
                global licenseUses = r2.uses;
                global retCurrTime = r2.retCurrTime;
                global licenseIsValid = r2.valid;
                global errorMessage = r2.error;

                Console.print("licenseUses: " + licenseUses);
                Console.print("licenseIsValid: " + licenseIsValid);
                Console.print("response is:" + trace(r2));
                Console.print("status is:" + serverStatus);

                if(licenseIsValid == 1 && licenseUses < ActivationsCount && p2.currTime == retCurrTime) {
                    Console.print("Ok second auth, set valid");
                    // seteamos secondCheckDone en true
                    dataToEncrypt = {
                        "OuathReg": FileSystem.getSystemId(),
                        "secondCheckDone": true,
                        "Compl1": "212d0dJk3SkTkjd89d8sKJDKJSs83SkTk9JKDKJ4848938498S3SkTkK",
                        "Compl2": "7aiJL1zjKn95H5TV2uqnVqlPDPynT8Ts31T2ukjjmxGLRzFkIW3SkTkVvWp7zZNLLFE2jCD0f1lJhU8dfscZq2naCyVJWgJ90ih0U7HkyNqeRzIx566WRuwvLJOZqFAuJURncvdMoNwxAgm1P4ygN2KUyzVU1ybwxxM4em4Ah4R6S9X0g3jGNeJGOw2yyzgoSO0Q4nkaZCgvAMVN0WUI9Ga0P2yvzsGxf09DDhkZK9bdfIvCJRKJbC32goZJ8z7eNHbSbPeUfijLKatsJUNIkw5LCSQIuBVKySPbFsVcCAEOSAI7oqaIyhwbZBEfTwer",
                        "licenseKey": licenseKey,
                        "checkTime": r2.checkTime
                    };
                    FileDirectory = FileSystem.getFolder(FileSystem.UserPresets).getParentDirectory();
                    FileDirectory.getChildFile("RegData.js").writeEncryptedObject(dataToEncrypt, UserPIN);
                    setValidLicense(true);
                }
                else {
                    Console.print("Bad second auth, set invalid");
                    setValidLicense(false);
                }
            });
        }
        else {
            Console.print("Different SystemID, set invalid");
            setValidLicense(false);
        }
    }
    
    // Timer usado para el segundo chequeo de licencia
    const var dialogTimer = Engine.createTimerObject();
    
    dialogTimer.setTimerCallback(function () {
            checkOnTimer();
            dialogTimer.stopTimer();
        }
    );
    
    // Cambiar para comparar 48 horas
    const var SerialInput = Content.getComponent("SerialInput");
    const var Description = Content.getComponent("Description");
    
    //const var SerialStateLabel = Content.getComponent("SerialStateLabel");
    const var AuthorisationDialogue = Content.getComponent("AuthorisationDialogue");
    //const var GlobalMute = Synth.getMidiProcessor("GlobalMute");
    const var GlobalMute = Synth.getEffect("GlobalMute");
    var decryptedData;
    
    //const var productId1 = Content.getComponent("productId1");
    //const var productId2 = Content.getComponent("productId2");

  	//productId1.set("text", productId);  
   	//productId2.set("text", productId);        
 
    /** Checks if the serial input is valid and stores the result if successful. */
    inline function onSubmitButtonControl(component, value) {
        if(!value) // Just execute once
            return;
 
        // Server busy or done
        Server.setServerCallback(function(isWaiting) {
            //Console.print(isWaiting ? "SERVER IS BUSY" : "DONE");
        
            if (isWaiting == true) {
                Console.print("is waiting");
                Description.set("text", "Checking your license...");
            }
            else{
                Console.print("is done");
            }
        });                 

        if (Server.isOnline() == 0) {// Check internet status on button click
            Console.print("offline 1");
            Description.set("text", "Check your internet conection");
        }
        else {
            licenseKey = SerialInput.getValue();
            Console.print(licenseKey);
	
            local onlineStatus = Server.isOnline();

            currTimeOS = secondsFrom2021(Engine.getSystemTime(1));
            
            // agregar un valor random de aproximadamente 48 horas
            //checkTime = currTimeOS + 12 * 60 * 60 + Math.randInt(60 * 60, 5 * 60 * 60);
            checkTime = currTimeOS + 5;
            local p1 = {
                "licenseKey": licenseKey,
                "productId": productId,
                "currTime": currTimeOS
            };

            reg r1;

            Server.setBaseURL("https://308service.com");
            Server.callWithPOST("/api/v1/licenses/validations", p1, function(status, response) {
                r1 = response;
            
                global serverStatus = status;
                global licenseUses = r1.uses;
                global licenseIsValid = r1.valid;
                global retCurrTime = r1.retCurrTime;
                global errorMessage = r1.error;

                Console.print("licenseUses: " + licenseUses);
                Console.print("licenseIsValid: " + licenseIsValid);
                Console.print("retCurrTime: " + retCurrTime);
                Console.print("response is:" + trace(r1));
                Console.print("status is:" + serverStatus);
            
                // Checks if it's in the input
                if(licenseIsValid == 1 && licenseUses < ActivationsCount && currTimeOS == retCurrTime) {
                    Console.print("Serial number found");
        
                    dataToEncrypt = {
                        "OuathReg": FileSystem.getSystemId(),
                        "Compl1": "212d0dJk3SkTkjd89d8sKJDKJSs83SkTk9JKDKJ4848938498S3SkTkK",
                        "Compl2": "7aiJL1zjKn95H5TV2uqnVqlPDPynT8Ts31T2ukjjmxGLRzFkIW3SkTkVvWp7zZNLLFE2jCD0f1lJhU8dfscZq2naCyVJWgJ90ih0U7HkyNqeRzIx566WRuwvLJOZqFAuJURncvdMoNwxAgm1P4ygN2KUyzVU1ybwxxM4em4Ah4R6S9X0g3jGNeJGOw2yyzgoSO0Q4nkaZCgvAMVN0WUI9Ga0P2yvzsGxf09DDhkZK9bdfIvCJRKJbC32goZJ8z7eNHbSbPeUfijLKatsJUNIkw5LCSQIuBVKySPbFsVcCAEOSAI7oqaIyhwbZBEfTwer",
                        "licenseKey": licenseKey,
                        "checkTime": checkTime,
                        "secondCheckDone": true
                    };

                    //Browse to the file
                    FileDirectory = FileSystem.getFolder(FileSystem.UserPresets).getParentDirectory();        
                    FileDirectory.getChildFile("RegData.js").writeEncryptedObject(dataToEncrypt, UserPIN);            
                    //Engine.dumpAsJSON(data, "../RegistrationInfo.js");              
                    setValidLicense(true);
                }
                else {              
                    if (errorMessage == "Par\u00e1metro faltante") {
                        Console.print("empty input");
                        Description.set("text", "Type or paste a license key");
            
                        setValidLicense(false);   
                    }
                    else {         
                        if (licenseIsValid == 0) {
                            Console.print("Invalid serial number");
                            Description.set("text", "Invalid Licence Key");
            
                            setValidLicense(false);
                        }
                        else if (licenseUses > ActivationsCount) {
                            Console.print("exceded activation count");
                            Description.set("text", "Too many activations for this license (Code:400)");
            
                            setValidLicense(false);
                        }
                    }
                }
            });
        }
    };

    Content.getComponent("SubmitButton").setControlCallback(onSubmitButtonControl);

    inline function setValidLicense(isValid) {
        // Do whatever you want to do here. I suggest a MIDI muter...
        GlobalMute.setBypassed(isValid);
    
        if(isValid) {
            // Change this to any other visual indication...
            // SerialStateLabel.set("bgColour", Colours.greenyellow);
            AuthorisationDialogue.set("visible", false);
        }
        else {
            //SerialStateLabel.set("bgColour", Colours.red);
            AuthorisationDialogue.set("visible", true);
        }
    }

    inline function checkOnLoad() {
        Console.print("checkOnLoad");
        Description.set("text", "Type or paste your license key");
        
        //Check internet conection
        if (Server.isOnline() == 0) {
            Console.print("offline");
            Description.set("text", "Check your internet conection");
        }

        // Clear the input
        SerialInput.set("text", "");
        
        // Load the serial from the stored file
        //local pData = Engine.loadFromJSON("../RegistrationInfo.js");
        Console.print("Checking serial");
        
        //Get encrypted file/object 
        local FileDirectory = FileSystem.getFolder(FileSystem.UserPresets).getParentDirectory();
    
        decryptedData = FileDirectory.getChildFile("RegData.js").loadEncryptedObject(UserPIN);
    
        //Console.print(decryptedData.OuathReg);
        // Load contents of the encrypted object
        //local pData = Engine.loadFromJSON(FileDirectory);

        if(decryptedData) {
            local vStatus = decryptedData.OuathReg;
            Console.print("Restored machineID: " + vStatus);

            local machineId = FileSystem.getSystemId();

            if(decryptedData.OuathReg != FileSystem.getSystemId()) {
                setValidLicense(false);
                return;
            }

            Console.print("### secondCheckDone: " + decryptedData.secondCheckDone);
            if(decryptedData.secondCheckDone == false) {
                // Tiempo actual
                //Console.print(Engine.getSystemTime(1));
                //var date = Engine.getSystemTime(0);
                //const var curr_time = date.substring(11,13);
                //Console.print(curr_time);
                 currTimeCOL = secondsFrom2021(Engine.getSystemTime(1));

                // Tiempo de chequeo
                 local check_time = decryptedData.checkTime;
                Console.print("curr_time: " + currTimeCOL);
                Console.print("check_time: " + check_time);

                if(check_time < currTimeCOL) {
                    Console.print("Chequear licencia de nuevo");
                    local delta_time = Math.randInt(10, 90);
                    Console.print("delta_time: " + delta_time);
                    dialogTimer.startTimer(delta_time * 1000);
                }
                setValidLicense(true);
                return;
            }
            else {
                  setValidLicense(true);
                  return;
            }
        }

        setValidLicense(false);
    }

    // Call this on startup
    checkOnLoad();
}
