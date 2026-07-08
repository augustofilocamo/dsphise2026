const var playbutton = Content.getComponent("playbutton");
const var laf = Content.createLocalLookAndFeel();

laf.setInlineStyleSheet("
button
{
	background: #af0000;
	border-radius: 30px;
	color: white;
	transition: background-color 0.5s ease-in;
	color: #af0000;
	border: 4px solid black;
}

button::after
{
	content: '';
	position: absolute;
	top: -4px;
	left: -4px;
	right: 0px;
	bottom: -4px;
	border-radius: 40px;
	background: linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 0, 0, 0));
	pointer-events: none;
}

button:hover
{

	
}

button:active
{
	margin: 1px;
}

button:checked
{
	background: Colours.darkgrey;
	color: #af0000;
}
");

playbutton.setLocalLookAndFeel(laf);


