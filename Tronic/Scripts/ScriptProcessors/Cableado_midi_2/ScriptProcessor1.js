Content.setHeight(600);
Content.setWidth(1024);




function onNoteOn()
{
	Console.print(Message.getNoteNumber() + " Note on");
	const var veloParameterId = veloSliderParameterId.getValue();
	const var freqParameterId = freqSliderParameterId.getValue();
	
	freqToBool();
	
	// Velo cables
	
	if 	(veloParameterId != -1)
	{
		if (veloParameterId == 0 || veloParameterId == 8 || veloParameterId == 10)
	    {
	        // Convierte la velocidad en un valor entre 0 y 1 como booleano
	        HardcodedMasterFX2.setAttribute(veloParameterId, veloToBool()); 
	
	    }
	    else if (veloParameterId == 1 || veloParameterId == 6)
	    {
	        // Convierte la velocidad en un valor entre 0 y 400
	        HardcodedMasterFX2.setAttribute(veloParameterId, veloTo0400()); 
	        
	    }
	    else if (veloParameterId == 2 || veloParameterId == 7)
	    {
	        // Convierte la velocidad en un valor entre 0 y 5000
	        HardcodedMasterFX2.setAttribute(veloParameterId, veloTo05000()); 
	    }
	    else if (veloParameterId == 3)
	    {
	        // Convierte la velocidad en un valor entre 0 y 1 como booleano (igual al caso 0)
			HardcodedMasterFX2.setAttribute(veloParameterId, veloToBool());
	    }
	    else if (veloParameterId == 4 || veloParameterId == 9 || veloParameterId == 12)
	    {
	        // Convierte la velocidad en decibelios usando la función de ganancia
	       	HardcodedMasterFX2.setAttribute(veloParameterId, veloToGain()); 
	    }
	    else if (veloParameterId == 5)
	    {
	        // Convierte la velocidad en un valor entre 1 y 1000
	       	HardcodedMasterFX2.setAttribute(veloParameterId, veloTo01000()); 
	    }
	    else if (veloParameterId == 11)
	    {
	        // Convierte la velocidad en un valor entre 0 y 2
	       	HardcodedMasterFX2.setAttribute(veloParameterId, veloTo02()); 
	    }	
	}
    
	
	// Freq cables

	if 	(freqParameterId != -1)
	{
		if (freqParameterId == 0 || freqParameterId == 8 || freqParameterId == 10)
		{
		    // Convierte la velocidad en un valor entre 0 y 1 como booleano
		    HardcodedMasterFX2.setAttribute(freqParameterId, freqToBool()); 
		}	
		
		else if (freqParameterId == 1 || freqParameterId == 6)
		{
		    // Convierte la velocidad en un valor entre 0 y 400
		    HardcodedMasterFX2.setAttribute(freqParameterId, freqTo0400()); 
		}	
		else if (freqParameterId == 2 || freqParameterId == 7)
	    {
	        // Convierte la velocidad en un valor entre 0 y 5000
	        HardcodedMasterFX2.setAttribute(freqParameterId, freqTo05000()); 
	    }
	    else if (freqParameterId == 3)
	    {
	        // Convierte la velocidad en un valor entre 0 y 1 como booleano (igual al caso 0)
			HardcodedMasterFX2.setAttribute(freqParameterId, freqToBool());
	    }
	    else if (freqParameterId == 4 || freqParameterId == 9 || freqParameterId == 12)
	    {
	        // Convierte la velocidad en decibelios usando la función de ganancia
	       	HardcodedMasterFX2.setAttribute(freqParameterId, freqToGain()); 
	    }
	    else if (freqParameterId == 5)
	    {
	        // Convierte la velocidad en un valor entre 1 y 1000
	       	HardcodedMasterFX2.setAttribute(freqParameterId, freqTo01000()); 
	    }
	    else if (freqParameterId == 11)
	    {
	        // Convierte la velocidad en un valor entre 0 y 2
	       	HardcodedMasterFX2.setAttribute(freqParameterId, freqTo02()); 
	    }	
	}
	
	
}

 function onNoteOff()
{
	
}
 function onController()
{
	
}
 function onTimer()
{
	
}
 function onControl(number, value)
{
	
}
 