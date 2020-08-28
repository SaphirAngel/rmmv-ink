/*:
 * @plugindesc Integrates the Ink story scripting language (https://www.inklestudios.com/ink/) into RPG Maker.
 * @author Logan Pickup
 * 
 * @param ink_script
 * @text Ink script
 * @desc Name of the Ink script. Must be exported with the "export to JSON" option, and must be in the data folder.
 * @type text
 * @default inkscript.ink.json
 * 
 * @param enable_formatting
 * @text Enable formatting
 * @desc Turn this on to enable basic formatting. Currently the only thing it does is convert _text_ to \C[1]text\C, so emphasis looks more natural in the script.
 * @type boolean
 * @default true
 * 
 * @param emphasis_colour
 * @text Emphasis colour
 * @desc If "Enable formatting" is turned on, this controls the colour used for _emphasis_. It can be any colour allowed for the \C[] escape.
 * @type number
 * @default 1
 * 
 * @param use_yep_name_box
 * @text Use YEP_MessageCore name boxes
 * @desc Turn this on to enable using YEP_MessageCore name boxes when the name is known, e.g. if the name was set using cast_link() or cast() and the name was used as a hashtag.
 * @type boolean
 * @default true
 * 
 * @param yep_name_box_location
 * @text YEP_MessageCore name box location
 * @desc Whether to put the name box at the left, centre, or right.
 * @type select
 * @option Left
 * @value n
 * @option Centre
 * @value nc
 * @option Right
 * @value nr
 * @default n
 * 
 * @help 

Integrates the Ink (https://www.inklestudios.com/ink/) scripting language into RPG Maker MV. Provides plugin commands for triggering Ink, allows sharing variables between Ink and RMMV, and provides some extension functions and hashtags that allow more control over RMMV from within Ink.

Getting Started

Download the javascript port of the Ink engine from here: https://github.com/y-lohse/inkjs Take the copy of ink.js from the templates/browser_serverless folder and put it in your RMMV plugins folder (js/plugins). Download LWP_Ink.js from this repo and put it in your RMMV plugins folder, too.

Add both ink.js and LWP_Ink.js to your plugins in RMMV. ink.js must be higher in the list than LWP_Ink.js; drag them around to make sure this is the case if it's not already.

It's also highly recommended to use the YEP_MessageCore (http://www.yanfly.moe/wiki/Message_Core_(YEP) plugin to handle word wrapping. This plugin has only been tested with YEP_MessageCore; if you need it to work with a different word wrapping plugin let me know.

Usage

First you need to export your Ink script as JSON. From Inkle, select File->Export to JSON... and save the file as inkscript.ink.json in your game's data folder. You need to repeat this export process whenever you make changes to the script in Inkle.

In order to start running Ink from RMMV, just use the plugin command INK. Without parameters it starts the Ink script from the begnning and continues until it reaches the end. It is probably more useful to use it to start at specific paths; just put the knot's name (including a dot and the stitch, if desired), for example:

INK admitted_to_something.i_know_where

This plugin will continue to run Ink until it stops via -> END or -> DONE, although some special tags can affect this behaviour; see the section on hashtags below. This makes it convenient to, for example, have a knot in Ink per NPC or per scene:

	=== npc_alice ===
	* [Just ask Alice]
		When I was ten feet tall?
	+ [I'll be on my way]
	- -> DONE

And then when you interact with this NPC in game, use the plugin command INK npc_alice, and have Ink figure out what the dialogue options are. See below for more integration options.
Integration with RPG Maker MV
Message Boxes

The text from Ink is passed as-is to RPG Maker MV. This means that you can use any RMMV escape codes you want to, as long as anything that conflicts with Ink syntax is escaped properly. You should also be able to use custom escape codes and notetags that any plugins you use allow.

LWP_Ink also has its own set of controls over the message boxes using Ink hashtags; see the section on hashtags below.
Variables

RMMV variables can be accessed from Ink using the external functions rmmv_var() and rmmv_switch() (see the seection on external functions below). These functions return the current value of a variable or a switch. If you want to check the state of an Ink variable from RMMV, you must use the link_var() and link_switch() external functions instead. These functions link an Ink variable to an RMMV variable or switch, allowing updates to pass between both engines; if a change to a variable is made in Ink, it is updated in RMMV; and if a variable is updated in RMMV, it is also changed in Inky.

Example:

VAR foo = 0
~ link_var(foo, 1)

And from then on, the variable "foo" is synced between Ink and the RMMV variable 1. If you do the following in Ink:

~ foo = 13

Then RMMV will see the updated value in variable 1; similarly, if you change variable 1 in RMMV, then foo in Ink will also get the changed value.

Only number and string variables are supported for syncing between Ink and RMMV.

If the Ink variable type is a boolean (i.e. it is initially set to true or false) then it should be synced with an RMMV switch instead using link_switch(). If the Ink variable is then later assigned a non-boolean type (something other than true or false) in Ink then you will not get the results you expect; please don't do this.

There is no method for getting Ink variables from RMMV plugin code.

Loading and Saving

Ink state is saved as a part of the savegame. Certain pieces of state are not saved if the game is saved in the middle of displaying content, and any currently-running common event is not saved either. It shouldn't be possible to save the game at these points, so it shouldn't be a problem.

When Ink Can Be Called

Ink can be called anywhere the plugin command action is allowed - i.e. the map or in a battle. It doesn't work as well inside a battle, though, and you should first use RMMV commands to disable the battle input if you're planning on showing a lot of dialogue. Ink has no commands for controlling RMMV state except for the #common_event hashtag; see the section on hashtags below.

Plugin Commands

	INK Starts Ink from wherever it left off; starts at the beginning if it hasn't started yet. Does nothing if the Ink script has ended. Once started, Ink will keep running until an interrupt allows RPG Maker to take over again. Ink will not start running until it is able to show a message box; it will not pause the current event or stop it from running.
	INK path Starts Ink at the specified knot (You can use "." to specify a stitch, too) instead of where it left off or where it would normally start.

Using Ink in other places

Ink can be called to supply text for other places too - anywhere that RMMV escape codes will work. This includes:

	character profiles
	item descriptions
	state messages

It does not include:

	character names
	item names
	monster names
	terms

If you are using a plugin that changes where escape codes work, this may, depending on the plugin, also change where Ink is able to be called from too.

In order to use this functionality, just use the code {ink:knot.stitch} to include the text from the specified knot/stitch. For example, if you have the following in an Ink script:

	== main_character ==
	= bio
	A simple farm girl, everything changed when she discovered she was the chosen one!

Then you can show this by entering {ink:main_character.bio} in the "Profile" section of a character in the RPG Maker database.

Ink content included this way is different from Ink content from the plugin command:

	It never changes state. In order to stop other parts of this script from breaking, any changes to state are undone. This includes any changes to what is considered the current location in the text, as well as the "seen" counters on knots and stitches. There is a known bug related to this that will cause changes to be synced to RPG Maker before the state change is undone, so please don't change any synced variables.
	Choices have no effect. Choices will not be shown and only text from before the choice will be seen.

External Functions

The following external functions are available in Ink. They need to be defined at the top of one of your ink files using the syntax shown.

	EXTERNAL link_var(ref varname, x) Links the variable varname to the RMMV variable x. The values will be automatically synced when going from/to Ink. Also, this will set the current value of varname to the RMMV variable it is linked to immediately.
	EXTERNAL link_switch(ref varname, x) Links the variable varname to the RMMV switch x. The values will be automatically synced when going from/to Ink. Also, this will set the current value of varname to the RMMV switch it is linked to immediately.
	EXTERNAL rmmv_var(x) Retrives the value of RMMV variable x.
	EXTERNAL rmmv_switch(x) Retrives the value of RMMV switch x.
	EXTERNAL link_actor_name(ref varname, actor_index) Links the name of an Actor to an Ink variable. Unlike link_var and link_switch the RMMV Actor name will be set based on the Ink variable when this is called.
	EXTERNAL cast(name, image, default_index) Sets up a member of the cast. The name given is associated with an image (should be the filename of an image in img/faces) and a default index in the image. This image is used whenever you use the name as a hashtag.
	EXTERNAL cast_link(ref name, actor_index, image, default_index) This is a combination of cast() and link_actor(). If you're using both, this will save you some setup! The difference is that the first parameter is a variable, not a string, and it will both link the variable to the actor's name in RMMV and allow the variable's name (not the actor's name, as that can change!) to be used as a hashtag like with cast().
	EXTERNAL expression(expression_name, index) Sets up an expression, e.g. happy, frustrated, etc. When the expression is used as a hashtag, the same image file will be used but the index within the file will be changed to the specified index.

Hashtags

This plugin processes certain hashtags from Ink. The hashtags can be defined at the top of a knot or even at the top of an Ink script if you need the same flags for all messages; there is no "override" mechanism though, so if you have #bottom at the top of a knot and then #middle for a single line of text, that line of text will get both #top and #bottom hashtags, and the final location of the message box might not be where you want it, so make sure you really want the hashtag to appear everywhere before you do this.

"Action" hashtags like #common_event or #battle should only ever be used for single lines.

The following hashtags can be used:

	#top, #middle and #bottom Move the message window to the top, middle or bottom - same as the "Window Position" field in RMMV's show text command.
	#window, #dim and #transparent Controls the background of the message box - same as the "Background" field in RMMV's show text command.
	#Actor1, #Actor1,4 If the hashtag is the name of a face image, then it will be used as the face for the message box. Case is important - it will not find the image if the capitalisation is wrong. Optionally you can also put the subimage to use; if not specified, it defaults to 0.
	#interrupt Stops running Ink after showing the tagged content. Calling the plugin command INK without any parameters will continue from the next piece of content.
	#common_event(x) Runs the common event x. Control will pass over to the common event until it finishes, after which Ink will resume again. If Ink is called again from the common event then the current Ink knot will be overwritten by the new target, but Ink will still not start running until the common event finishes; this is unintuitive, so it is best to just avoid calling Ink from a common event called by Ink.
	#battle(troopId,winTarget,escapeTarget,loseTarget) Starts a battle. It is possible to just pass control to a common event and start the battle from there, but this way allows you to jump easily jump to different Ink paths based on the outcome of the battle (it is still possible with a common event by using linked variables). This hashtag also stops Ink running, just like #interrupt - if you want to continue the Ink dialogue during the battle, do the INK plugin command from within the battle itself. troopId is the number of the troop to use for the battle. If set to 0, or not set, the troop is determined randomly using RMMV's normal mechanism. winTarget is the path to go to in Ink if the battle is won. escapeTarget is the path to go to in Ink if the battle is escaped from or aborted. loseTarget is the path to go to in Ink if the battle is lost. winTarget,escapeTarget, and loseTarget can take the same format of paths that Ink can: either a knot, a knot.stitch, or a stitch by itself, provided the stitch is in the current knot and the stitch does not have the same name as a knot. Any parameter can be omitted, and if escapeTarget ot loseTarget are omitted then the battle cannot be escaped from or will end in game over if the battle is lost, respectively. For example, to prevent escape but prevent a game over: #battle(0,win,,lose)
	#name If the hashtag is the name of a character defined with cast(name, image, index) or cast_link(ref name, image, index) then it will cause that image to be used. Equivalent to using the image name and index directly as a hashtag, but easier to read. Additionally, if the "Use YEP_MessageCore name boxes" option is enabled, then the name will be set in the name box. If the cast_link variant was used to set this up, then the current value of the name variable will be used in the name box.
	#expression If the hashtag is the name of an expression defined with expression(expression, index) then it will cause the image index to change to the one specified for the expression. The image used will not change.

A full example of using cast() and expression with hashtags:

	VAR PRAXIS = 'Praxis'
	~ cast('Ingrid', 'Actor1', 0)
	~ cast_link(PRAXIS, 2, 'Alien3', 0)
	~ expression('ecstatic', 1)
	~ expression('inscrutable', 2)

	Hi. #PRAXIS

	OMG you're the new alien! #Ingrid #ecstatic

	I could be. #PRAXIS #inscrutible

Localisation

This plugin supports both IAVRA.MasterLocalization and DKTools_Localization. It can go above or below either of those two scripts, it's not important. It will use the currently-set language from whichever localisation plugin you have installed to load a localised version of the Ink script. If your Ink script is normally "data/script.ink.json" then the localised version should be named "data/script.ink-es.json". The text in the "languages" list for the IAVRA.MasterLocalization plugin will be used if it is active, which is normally a short language code. The text in the "Short language name", also known as "Locale", in the DKTools_Localization plugin will be used if it is active.

It supports changing languages part-way through the game.

Note that there's no need to add anything to either plugin's JSON files; the Ink script itself should be fully translated instead and exported. This should make it convenient to hand off to a translator, since you can just give them the Ink script instead of trying to extract all the strings from RPG Maker.

IMPORTANT: When translating, the structure of the Ink script must stay exactly the same, including the names of variables, knots and stitches, and number and location of choices (including choice labels if they are used). If the structure is different, switching languages mid- game will not work, and loading savegames from a different language will also not work.

If this can't be avoided, you must not allow the player to change languages after the game starts. This includes changing language then loading a saved game from a different language!

 */
var Imported     = Imported || {};
Imported.LWP_Ink = true;

(function () {

//////////////////////////////////////////////////////////////////
// LWP_InkManager
// A class to hold all the Ink methods and data, so it can be
// used and overridden more easily by other plugins
//////////////////////////////////////////////////////////////////

// global visibility
    LWP_InkManager = function () {
        throw new Error('This is a static class');
    }

//----------------------------------------------------
// init

    let parameters = PluginManager.parameters("LWP_Ink")

    LWP_InkManager._inkStory               = null;    // only accessed directly by LWP_InkManager.getStory()
    LWP_InkManager.inkStoryFolder          = "data/";
    LWP_InkManager.inkStoryFilenameOnly    = (parameters['ink_script'] || "inkscript.ink.json").trim();
    LWP_InkManager.enableFormatting        = !!(parameters['enable_formatting'] || false);
    LWP_InkManager.emphasisColour          = parameters['emphasis_colour'] || 1;
    LWP_InkManager.useYepNameBox           = !!(parameters['use_yep_name_box'] || false);
    LWP_InkManager.yepNameBoxLocation      = parameters['yep_name_box_location'] || 'n';
    LWP_InkManager.inkStoryFilename        = LWP_InkManager.inkStoryFolder + LWP_InkManager.inkStoryFilenameOnly;
    LWP_InkManager.active                  = false;
    LWP_InkManager.stopAfterMessage        = false;
    LWP_InkManager.variableBindings        = {};
    LWP_InkManager.switchBindings          = {};
    LWP_InkManager.actorNameBindings       = {};
    LWP_InkManager.cast                    = {};
    LWP_InkManager.expressions             = {};
    LWP_InkManager._queuedActions          = [];
    LWP_InkManager._childInterpreter       = null;
    LWP_InkManager._currentLocalisationTag = "";

    LWP_InkManager._internalWaitMode  = "";
    LWP_InkManager._internalWaitCount = 0;

    LWP_InkManager._eventIsMoving = null;

    LWP_InkManager._characters       = [];
    LWP_InkManager._currentCharacter = null;

    LWP_InkManager.getLocalisationTag = function () {
        if (Imported.DKTools_Localization) {
            //return DKTools.Localization.language;
            return DKTools.Localization.locale;
        } else if (Imported.IAVRA_MasterLocalization) {
            return IAVRA.MasterLocalization.I18N.language;
        }
        return "";

    }

    LWP_InkManager.getStory = function () {
        let currentLocalisationTag = this.getLocalisationTag();
        if (!this._inkStory || currentLocalisationTag != this._currentLocalisationTag) {
            this._currentLocalisationTag = currentLocalisationTag;
            const saveData               = this._inkStory ? this._inkStory.state.ToJson() : null;
            this._inkStory               = this.loadInkStory(this.inkStoryFilename, currentLocalisationTag);
            this.bindFunctions(this._inkStory);
            if (saveData) {
                // preserve the current story state when switching languages
                this._inkStory.state.LoadJson(saveData);
            }
        }
        return this._inkStory;
    }

    LWP_InkManager.loadInkData = function (filename, localisationTag) {
        const fs                = require('fs');
        const path              = require('path');
        const base              = path.dirname(process.mainModule.filename);
        const pathname          = path.join(base, filename);
        const withoutSuffix     = pathname.substring(0, pathname.lastIndexOf('.'));
        const suffix            = pathname.substring(pathname.lastIndexOf('.'));
        const localisedSuffix   = localisationTag === "" ? "" : ("-" + localisationTag);
        const localisedFilename = withoutSuffix + localisedSuffix + suffix;
        // TODO: handle a file not exists error and fall back to the default filename
        return fs.readFileSync(localisedFilename, {encoding: 'utf8'}).replace(/^\uFEFF/, ''); //strips the BOM
    }

    LWP_InkManager.loadInkStory = function (filename, localisationTag) {
        const Story = inkjs.Story;
        return new Story(this.loadInkData(filename, localisationTag));
    }

//----------------------------------------------------
// external function bindings

    LWP_InkManager.bindFunctions = function (story) {
        story.BindExternalFunction("link_var", this.external_LinkVar);
        story.BindExternalFunction("link_switch", this.external_LinkSwitch);
        story.BindExternalFunction("link_actor_name", this.external_LinkActorName);
        story.BindExternalFunction("rmmv_var", this.external_rmmvVar);
        story.BindExternalFunction("rmmv_switch", this.external_rmmvSwitch);
        story.BindExternalFunction("cast", this.external_cast);
        story.BindExternalFunction("cast_link", this.external_castLink);
        story.BindExternalFunction("expression", this.external_expression);
    }

    LWP_InkManager.external_LinkVar = function (variableRef, rmmvVariable) {
        console.log('link_var', variableRef, rmmvVariable);
        this.variableBindings[variableRef]          = rmmvVariable;
        this.getStory().variablesState[variableRef] = $gameVariables.value(rmmvVariable);
    }.bind(LWP_InkManager);

    LWP_InkManager.external_LinkSwitch = function (variableRef, rmmvSwitch) {
        console.log('link_switch', variableRef, rmmvSwitch);
        this.switchBindings[variableRef]            = rmmvSwitch;
        this.getStory().variablesState[variableRef] = $gameSwitches.value(rmmvSwitch);
    }.bind(LWP_InkManager);

    LWP_InkManager.external_LinkActorName = function (variableRef, rmmvActorIndex) {
        console.log('link_actor_name', variableRef, rmmvActorIndex);
        this.actorNameBindings[variableRef] = rmmvActorIndex;
        // works the opposite way to linking variables - the RMMV name is overwritten with
        // the name defined in the story. This is to allow Ink to control localised names.
        $gameActors.actor(rmmvActorIndex).setName(this.getStory().variablesState[variableRef]);
    }.bind(LWP_InkManager);

    LWP_InkManager.addCastEntry = function (name, useVariable, image, index) {
        this.cast[name] = {useVariable, image, index};
    }

    LWP_InkManager.external_cast = function (name, rmmvImageName, defaultImageIndex) {
        console.log('cast', name, rmmvImageName, defaultImageIndex);
        this.addCastEntry(name, false, rmmvImageName, defaultImageIndex);
    }.bind(LWP_InkManager);

    LWP_InkManager.external_castLink = function (nameRef, rmmvActorIndex, rmmvImageName, defaultImageIndex) {
        console.log('cast_link', nameRef, rmmvActorIndex, rmmvImageName, defaultImageIndex);
        this.addCastEntry(nameRef, true, rmmvImageName, defaultImageIndex);
        this.external_LinkActorName(nameRef, rmmvActorIndex);
    }.bind(LWP_InkManager);

    LWP_InkManager.external_expression = function (expression, rmmvImageIndex) {
        console.log('expression', expression, rmmvImageIndex);
        this.expressions[expression] = rmmvImageIndex;
    }.bind(LWP_InkManager);

    LWP_InkManager.external_rmmvVar = function (variable) {
        return $gameVariables.value(variable);
    }.bind(LWP_InkManager);

    LWP_InkManager.external_rmmvSwitch = function (variable) {
        return $gameSwitches.value(variable);
    }.bind(LWP_InkManager);

//----------------------------------------------------
// save/load

    LWP_InkManager.makeSaveContents = function () {
        const story = this.getStory();
        return {
            state: story.state.ToJson(),
            variables: this.variableBindings,
            switches: this.switchBindings,
            actorNames: this.actorNameBindings,
            cast: this.cast,
            expressions: this.expressions,
        };
    }

    LWP_InkManager.extractSaveContents = function (savedData) {
        const story = this.getStory();
        console.log("LOAD", savedData, savedData.state);
        story.state.LoadJson(savedData.state);
        this.variableBindings  = savedData.variables;
        this.switchBindings    = savedData.switches;
        this.actorNameBindings = savedData.actorNames;
        this.cast              = savedData.cast;
        this.expressions       = savedData.expressions;
    }

//----------------------------------------------------
// state

    LWP_InkManager.go = function (optionalPath) {
        if (optionalPath) {
            this.setInkPath(optionalPath);
        }
        this.active           = true;
        this.stopAfterMessage = false;
    }

    LWP_InkManager.stop = function () {
        console.log("INK: stopping");
        this.stopAfterMessage = true;
    }

    LWP_InkManager.isActive = function () {
        return (this._childInterpreter && this._childInterpreter.isRunning()) || this.active;
    }

//----------------------------------------------------
// Ink paths

    LWP_InkManager.setInkPath = function (target) {
        // TODO: call resolvePath on this?
        this.getStory().ChoosePathString(target);
    }

// Takes what might be a partial path (stitch only), and returns a fully qualified
// path including the knot. If the path is already qualified, returns it as-is; if
// the path is already the name of a knot, also returns it as-is. If neither of
// those conditions are true, prepends the current knot to the path.
// This does not guarantee that the result is a valid path; Ink provides no mechanism
// to list paths, and the only way to validate it is by attempting to use it, which
// we might not want to do yet.
    LWP_InkManager.resolvePath = function (path) {
        if (path === null || path === undefined) return path;
        // already fully qualified
        if (path.indexOf('.') !== -1) return path;
        const story = this.getStory();
        // the name of a knot - doesn't need further qualification
        if (story.KnotContainerWithName(path)) return path;
        // getting the current knot is *really* hacky
        const previousPath = story.state.callStack.currentThread.previousPointer.path.toString();
        const dotIndex     = previousPath.indexOf('.');
        const currentKnot  = dotIndex === -1 ? previousPath : previousPath.substring(0, dotIndex);
        return currentKnot + '.' + path;
    }

//----------------------------------------------------
// action queue - for when we want to do something when
// the message box isn't busy

    LWP_InkManager.enqueueAction = function (action) {
        this._queuedActions.push(action);
    }

    LWP_InkManager.dequeueAndRunAction = function () {
        if (this._queuedActions.length > 0) {
            const next = this._queuedActions.splice(0, 1)[0];
            console.log("Ink: running queued action", next);
            next();
            return true;
        }
        return false;
    }

//----------------------------------------------------
// variable syncing for automatically synced variables

    LWP_InkManager.syncVariablesToRmmv = function (story) {
        for (let inkVariable of Object.keys(this.variableBindings)) {
            $gameVariables.setValue(this.variableBindings[inkVariable], story.variablesState[inkVariable]);
        }
        for (let inkVariable of Object.keys(this.switchBindings)) {
            $gameSwitches.setValue(this.switchBindings[inkVariable], story.variablesState[inkVariable]);
        }
        for (let inkVariable of Object.keys(this.actorNameBindings)) {
            let actor = $gameActors.actor(this.actorNameBindings[inkVariable]);
            actor.setName(story.variablesState[inkVariable]);
        }
    }

    LWP_InkManager.syncVariablesToInk = function (story) {
        for (let inkVariable of Object.keys(this.variableBindings)) {
            story.variablesState[inkVariable] = $gameVariables.value(this.variableBindings[inkVariable]);
        }
        for (let inkVariable of Object.keys(this.switchBindings)) {
            story.variablesState[inkVariable] = $gameSwitches.value(this.switchBindings[inkVariable]);
        }
        for (let inkVariable of Object.keys(this.actorNameBindings)) {
            let actor                         = $gameActors.actor(this.actorNameBindings[inkVariable]);
            story.variablesState[inkVariable] = actor.name();
        }
    }

//----------------------------------------------------
// core output: content and choices

    LWP_InkManager.showContentInMessageBox = function (content, displayData) {
        $gameMessage.setFaceImage(displayData.face, displayData.faceIndex);
        $gameMessage.setBackground(displayData.background);
        $gameMessage.setPositionType(displayData.position);
        content = LWP_InkManager.formatText(content);
        if ($gameMessage.addText) {
            var textColor, fontSize, fontName;

            if (this._currentCharacter) {
                textColor = this._getParameters(this._currentCharacter, 'textColor', 'tc');
                fontSize  = this._getParameters(this._currentCharacter, 'fontSize', 'fs');
                fontName  = this._getParameters(this._currentCharacter, 'fontName', 'fn');
            }

            if (textColor) {
                content = '\\c[' + this._currentCharacter.get('textColor') + ']' + content;
            }

            if (fontSize) {
                content = '\\fs[' + this._currentCharacter.get('fontSize') + ']' + content;
            }

            if (fontName) {
                content = '\\fn[' + this._currentCharacter.get('fontName') + ']' + content;
            }

            if (displayData.nameBox) {
                content = '\\' + this.yepNameBoxLocation + '<' + displayData.nameBox + '>' + content;
                console.log('namebox', content);
            }
            // YEP_MessageCore support - this will use word wrapping if enabled
            $gameMessage.addText(content);
        } else {
            $gameMessage.add(content);
        }
    }

    LWP_InkManager.checkFaceTag = function (tag) {
        const validFaceNames = listInPath('img/faces', 'png');
        faceTagCandidate     = tag.split(',');
        if (validFaceNames.indexOf(faceTagCandidate[0]) !== -1) {
            let face      = faceTagCandidate[0];
            let faceIndex = 0;
            if (faceTagCandidate.length > 1) {
                faceIndex = Number.parseInt(faceTagCandidate[1]);
            }
            return {face: face, faceIndex: faceIndex};
        }
        return null;
    }

// this method only parses hashtags that directly affect displayed
// content. See processActionHashtags for hashtags that cause other
// effects. The general rule is that this method should have no side
// effects - it should only return an object that will later be
// passed to LWP_InkManager.showContentInMessageBox so the content
// can be displayed appropriately.
    LWP_InkManager.parseDisplayHashtags = function (tags) {
        const displayData        = {
            face: '',
            faceIndex: 0,
            position: 2,
            background: 0,
            nameBox: null
        };
        let expressionOverridden = false;
        for (let tag of tags) {
            if (this.cast[tag]) {
                console.log('#cast', tag, this.cast[tag]);
                displayData.face = this.cast[tag].image;
                if (!expressionOverridden) {
                    displayData.faceIndex = this.cast[tag].index;
                }
                if (this.useYepNameBox) {
                    let name = tag;
                    if (this.cast[tag].useVariable) {
                        name = this.getStory().variablesState[name];
                    }
                    displayData.nameBox = name;
                }
            } else if (typeof (this.expressions[tag]) !== "undefined") {
                console.log('#expression', tag, this.expressions[tag]);
                displayData.faceIndex = this.expressions[tag]
                expressionOverridden  = true;
            } else if (/top/i.test(tag)) {
                displayData.position = 0;
            } else if (/middle/i.test(tag)) {
                displayData.position = 1;
            } else if (/bottom/i.test(tag)) {
                displayData.position = 2;
            } else if (/window/i.test(tag)) {
                displayData.background = 0;
            } else if (/dim/i.test(tag)) {
                displayData.background = 1;
            } else if (/transparent/i.test(tag)) {
                displayData.background = 2;
            } else {
                faceTagData = this.checkFaceTag(tag);
                if (faceTagData) {
                    displayData.face = faceTagData.face;
                    if (!expressionOverridden) {
                        displayData.faceIndex = faceTagData.faceIndex;
                    }
                }
            }
        }
        return displayData;
    }

    LWP_InkManager.formatText = function (text) {
        console.log("Formatting enabled?", LWP_InkManager.enableFormatting);
        if (!LWP_InkManager.enableFormatting) return text;
        return text.replace(/_([^_]+)_/g, (match, group1) => {
            return '\\C[' + LWP_InkManager.emphasisColour + ']' + group1 + '\\C';
        });
    }

    LWP_InkManager.showContent = function (content, tags) {
        // TODO: word wrapping, buffering leftover text for next time
        const displayData = this.parseDisplayHashtags(tags);
        this.showContentInMessageBox(content, displayData);
    }

    LWP_InkManager.proccessContentCommand = function (commandName, commandParams, tags) {

        var parameterRegexPattern = /[-]{0,2}((?<key>\w+)(?:[=:](?<value>"[^"]+"|[^\s"]+))?)(?:\s+|$)/g

        var matches, parsedCommandParams = new Map();
        while (matches = parameterRegexPattern.exec(commandParams)) {

            if (matches.groups['value'] == undefined) {
                value = 1;
            } else {
                try {
                    value = JSON.parse(matches.groups['value'].trim());
                } catch (e) {
                    value = matches.groups['value'].trim();
                }
            }

            parsedCommandParams.set(matches.groups['key'], value);
        }

        if (this[commandName]) {
            this[commandName](parsedCommandParams, tags);
        } else {
            console.log('Function ' + commandName + ' not exist');
        }
    }


    LWP_InkManager.showChoices = function (choices, callback) {
        // TODO: error on choices that are too long?
        $gameMessage.setChoices(choices, 0 /*defaultType*/, -1 /*cancelType*/);
        $gameMessage.setChoiceBackground(0);
        $gameMessage.setChoicePositionType(2);
        $gameMessage.setChoiceCallback(callback);
    }

//----------------------------------------------------
// update

    LWP_InkManager.update = function () {
        if (this.updateChild() || $gameMessage.isBusy()) {
            return;
        }
        if (!this.dequeueAndRunAction() && this.active) {
            const story          = this.getStory();
            const tags           = this.advanceStory(story);
            const canShowChoices = this.processActionHashtags(tags);
            if (canShowChoices) {
                this.checkChoices(story);
            }
            if (!story.canContinue && story.currentChoices.length === 0) {
                console.log("CAN'T CONTINUE");
                this.stop();
            }
            if (this.stopAfterMessage && !$gameMessage.hasText()) {
                console.log("Ink: deactivating");
                this.active = false;
            }
        }
    }

    LWP_InkManager.getNextContent = function (story) {
        this.syncVariablesToInk(story);
        const content = story.Continue();
        this.syncVariablesToRmmv(story);
        return content.trim();
    }

    LWP_InkManager.advanceStory = function (story) {
        console.log("Ink: canContinue?", story.canContinue);
        if (story.canContinue) {
            const content = this.getNextContent(story);
            const tags    = story.currentTags;
            console.log("Ink: content with tags: ", content, tags);
            if (content != "") {
                var dialogRegexPattern  = /^(?<character>[^>]*)> ?(?<dialog>.*)/
                var commandRegexPattern = /^>[ ]*(?<command_name>[^ ]+)(?<command_params>.*)/

                /*
                 * COMMANDS
                 */
                var commandData = content.match(commandRegexPattern);
                if (commandData !== null) {
                    console.log("Ink: command " + content);
                    this.proccessContentCommand(commandData.groups['command_name'], commandData.groups['command_params'], tags);
                    return tags;
                }

                /*
                 * DIALOG
                 */
                var dialogData = content.match(dialogRegexPattern);
                if (dialogData !== null) {
                    this._currentCharacter = this._findCharacterByName(dialogData.groups['character']) || this._findCharacterById(dialogData.groups['character'])
                    this.showContent(dialogData.groups['dialog'], tags);
                    return tags;
                }

                console.log("Ink: other");
                this.showContent(content, tags);
            }
            return tags;
        }
        return [];
    }

    LWP_InkManager.checkChoices = function (story) {
        if (!story.canContinue && story.currentChoices.length > 0) {
            const choices     = story.currentChoices;
            const choicesText = choices.map(choice => choice.text);
            this.showChoices(choicesText, selection => {
                this.getStory().ChooseChoiceIndex(selection);
            });
        }
    }

//----------------------------------------------------
// non-display hashtag processing

    LWP_InkManager.matchHashtagCommand = function (tag, command) {
        return tag.startsWith(command + '(')
    }

    LWP_InkManager.getHashtagCommandParams = function (tag) {
        let paramStart = tag.indexOf('(') + 1;
        let paramEnd   = tag.indexOf(')', paramStart);
        if (paramEnd === -1) return [];
        let parameterText = tag.substring(paramStart, paramEnd);
        return parameterText.split(/,/).map(x => {
            let trimmed = x.trim();
            if (trimmed.length === 0) return null;
            else return trimmed;
        });
    }

// return true if choices can be shown this tick, false if something
// else is going on and the choices (if any) should be shown when
// the engine is next free
    LWP_InkManager.processActionHashtag = function (tag) {
        if (tag === 'interrupt') {
            this.stop();
        } else if (this.matchHashtagCommand(tag, 'common_event')) {
            let params           = this.getHashtagCommandParams(tag);
            let commonEventIndex = Number.parseInt(params[0]);
            console.log("LWP_Ink running common event " + commonEventIndex);
            this.runCommonEvent(commonEventIndex);
            return false;
        } else if (this.matchHashtagCommand(tag, 'picture')) {
            console.log('SHOW PICTURE');
            let params      = this.getHashtagCommandParams(tag);
            let pictureName = params[0];
            console.log("LWP_Ink showing picture " + pictureName);
            this.showPicture(pictureName);
            return false;
        } else if (this.matchHashtagCommand(tag, 'move_to_point')) {
            console.log('MOVE TO POINT');
            let params  = this.getHashtagCommandParams(tag);
            let eventID = params[0];
            let x       = params[1];
            let y       = params[2];
            console.log("LWP_Ink move to (" + x + "," + y + ")");
            this.moveToPoint(eventID, x, y);
            return false;
        } else if (this.matchHashtagCommand(tag, 'battle')) {
            let params = this.getHashtagCommandParams(tag);
            this.enqueueAction(() => {
                this.startBattle(
                    Number.parseInt(params[0]),
                    this.resolvePath(params[1]),
                    this.resolvePath(params[2]),
                    this.resolvePath(params[3])
                );
            });
            this.stop();
            return false;
        }
        return true;
    }

    LWP_InkManager.processActionHashtags = function (tags) {
        let canShowChoices = true;
        for (tag of tags) {
            canShowChoices = canShowChoices && this.processActionHashtag(tag);
        }
        return canShowChoices;
    }

//----------------------------------------------------
// embedded interpreter for running common events
    LWP_InkManager.updateWaitMode = function () {
        var waiting = false;
        switch (this._internalWaitMode) {
            case 'message':
                waiting = $gameMessage.isBusy();
                break;
            case 'transfer':
                waiting = $gamePlayer.isTransferring();
                break;
            case 'scroll':
                waiting = $gameMap.isScrolling();
                break;
            case 'route':
                waiting = $gameMap._interpreter._character.isMoveRouteForcing();
                break;
            case 'animation':
                waiting = $gameMap._interpreter.isAnimationPlaying();
                break;
            case 'balloon':
                waiting = $gameMap._interpreter._character.isBalloonPlaying();
                break;
            case 'gather':
                waiting = $gamePlayer.areFollowersGathering();
                break;
            case 'action':
                waiting = BattleManager.isActionForced();
                break;
            case 'video':
                waiting = Graphics.isVideoPlaying();
                break;
            case 'image':
                waiting = !ImageManager.isReady();
                break;
        }
        if (!waiting) {
            this._internalWaitMode = '';
        }
        return waiting;
    };

    LWP_InkManager.updateWaitCount = function () {
        if (this._waitCount > 0) {
            this._waitCount--;
            return true;
        }
        return false;
    }

    LWP_InkManager.updateChild = function () {
        if (this._childInterpreter) {
            this._childInterpreter.update();
            if (this._childInterpreter.isRunning()) {
                return true;
            } else {
                this._childInterpreter = null;
            }
        }

        if (this.updateWaitCount() || this.updateWaitMode()) {
            return true;
        }

        return false;
    };

    LWP_InkManager.runCommonEvent = function (event) {
        const list             = $dataCommonEvents[event].list
        this._childInterpreter = new Game_Interpreter(1);
        this._childInterpreter.setup(list, 0);
    }

//
// Picture
    LWP_InkManager.showPicture = function (pictureName) {
        $gameScreen.showPicture(1, pictureName, 0, 0, 0, 100, 100, 255, 0)
    }

//////////////////////////////////////////////////////////////////////////
// Commands private method
//////////////////////////////////////////////////////////////////////////

    /*
     * Get one paramater value with several names possible
     */
    LWP_InkManager._getParameters = function (parameters, ...parametersName) {
        var parameterValue = false;
        var parameterName  = null;
        for (parameterPosition in parametersName) {
            parameterName = parametersName[parameterPosition];

            if (!parameters.has(parameterName)) {
                continue;
            }

            parameterValue = parameters.get(parameterName)
        }

        return parameterValue;
    }

    LWP_InkManager._findCharacterByName = function (characterName) {
        var characterData = this._characters.filter(character => {
            if (character == null || !character.has('name')) {
                return false;
            }

            return character.get('name').trim() == characterName.trim();
        });

        return characterData[0] || null;
    }

    LWP_InkManager._findCharacterById = function (characterId) {
        var characterData = this._characters.filter(character => {
            if (character == null || !character.has('id')) {
                return false;
            }

            return character.get('id').trim() == characterId.trim();
        });

        return characterData[0] || null;
    }

    LWP_InkManager._getEventIDByName = function (eventName) {
        if (eventName == 'PLAYER') {
            return -1;
        }

        var validEvent = $dataMap.events.filter(event => {
            if (event == null) {
                return false;
            }

            return event.name == eventName;
        });

        return validEvent[0].id;
    }

    LWP_InkManager._getEventID = function (parameters, idParamName, nameParamName) {
        var eventID = 0;

        if (parameters.has(idParamName || 'id')) {
            eventID = parameters.get(idParamName || 'id');
        } else if (parameters.has(nameParamName)) {
            eventID = this._getEventIDByName(parameters.get(nameParamName || 'name'));
        } else if (this._getParameters(parameters, 'name', 'n')) {
            eventID = this._getEventIDByName(this._getParameters(parameters, 'name', 'n'));
        }

        return eventID;
    }

    LWP_InkManager._getCoord = function (parameters) {
        var coord = {x: 0, y: 0};

        if (parameters.has('xy')) {
            var xy  = parameters.get('xy');
            coord.x = parseInt(xy[0]);
            coord.y = parseInt(xy[1]);
        } else {
            if (parameters.has('x')) {
                coord.x = parseInt(parameters.get('x'));
            }

            if (parameters.has('y')) {
                coord.y = parseInt(parameters.get('y'));
            }
        }

        return coord;
    }

    LWP_InkManager._getDuration = function (parameters) {
        var durationInFrame = 0;
        if (parameters.has('s')) {
            durationInFrame = parseInt(parseFloat(parameters.has('ds')) * 60);
        } else if (parameters.has('df')) {
            durationInFrame = parseInt(parameters.get('df'));
        }

        return durationInFrame;
    }

    LWP_InkManager._wait = function (durationInFrame) {
        this._waitCount = durationInFrame;
    }


//////////////////////////////////////////////////////////////////////////
// Commands : link to RPGM COMMANDS
//////////////////////////////////////////////////////////////////////////


//----------------------------------------------------
// Moving event
    LWP_InkManager.move = function (parameters, actions) {
        var wait          = this._getParameters(parameters, 'wait', 'w');
        var targetEventID = this._getEventID(parameters);

        let eventToMove = null;
        if (targetEventID == -1) {
            eventToMove = $gamePlayer;
        } else {
            eventToMove = $gameMap.event(targetEventID);
        }

        let MVActions = {
            "list": []
        };

        for (action of actions) {
            MVActions.list.push({
                "code": 45,
                "parameters": [
                    action
                ],
                "indent": null
            });
        }

        MVActions.list.push({
            "code": 0
        });

        $gameMap.refreshIfNeeded();
        $gameMap._interpreter._character = eventToMove;
        eventToMove.forceMoveRoute(MVActions);
        if (wait) {
            this._internalWaitMode = "route";
        }
    }

//----------------------------------------------------
// Locate event
    LWP_InkManager.locate = function (parameters, tags) {
        var targetEventID    = this._getEventID(parameters);
        var destinationCoord = this._getCoord(parameters);
        var character        = $gameMap._interpreter.character(targetEventID);
        if (character) {
            character.locate(destinationCoord.x, destinationCoord.y);
        } else {
            console.log('Character not found : ' + targetEventID);
        }

        return true;
    }

//----------------------------------------------------
// Wait event
    LWP_InkManager.wait = function (parameters, tags) {
        var durationInFrame = this._getDuration(parameters);
        this._wait(durationInFrame);
    }

    LWP_InkManager.swap = function (parameters, tags) {
        var fromEventID = getEventID(parameters);
        var toEventID   = getEventID(parameters, 'idTo', 'nameTo');

        var character = $gameMap._interpreter.character(fromEventID);
        if (character) {
            var character2 = $gameMap._interpreter.character(toEventID);
            if (character2) {
                character.swap(character2);
            }
        }
        return true;
    }

//----------------------------------------------------
// Tint screen event
    LWP_InkManager.tint = function (parameters, tags) {
        var durationInFrame = this._getDuration(parameters);
        var tone            = this._getParameters(parameters, 'tone', 't');
        var wait            = this._getParameters(parameters, 'wait', 'w');

        $gameScreen.startTint(tone, durationInFrame);
        if (wait) {
            this._wait(durationInFrame);
        }
    }

//////////////////////////////////////////////////////////////////////////
// Commands : Custom commands
//////////////////////////////////////////////////////////////////////////


//----------------------------------------------------
// Character configuration
    LWP_InkManager.character = function (parameters, tags) {
        this._characters.push(parameters);
    }


//----------------------------------------------------
// battle

    LWP_InkManager.startBattle = function (troopId, winTarget, escapeTarget, loseTarget) {
        // this is a copy of the code for starting a battle in Game_Interpreter.prototype.command301
        if (!$gameParty.inBattle()) {
            troopId = troopId || $gamePlayer.makeEncounterTroopId();
            if ($dataTroops[troopId]) {
                BattleManager.setup(troopId, !!escapeTarget, !!loseTarget);
                BattleManager.setEventCallback(result => {
                    if (result === 0 && winTarget) {
                        // success
                        this.go(winTarget);
                    } else if (result === 1 && escapeTarget) {
                        // escape/abort
                        this.go(escapeTarget);
                    } else if (result === 2 && loseTarget) {
                        // defeat
                        this.go(loseTarget);
                    }
                });
                $gamePlayer.makeEncounterCount();
                SceneManager.push(Scene_Battle);
            }
        }
    }

//////////////////////////////////////////////////////////////////
// Game_Map - hooking into the update cycle
//////////////////////////////////////////////////////////////////

    const Game_MapUpdateEvents      = Game_Map.prototype.updateEvents;
    Game_Map.prototype.updateEvents = function () {
        Game_MapUpdateEvents.call(this);
        LWP_InkManager.update();
    }

//////////////////////////////////////////////////////////////////
// BattleManager - hooking into the update cycle
//////////////////////////////////////////////////////////////////

    const oldBattleManagerUpdateEventMain = BattleManager.updateEventMain;
    BattleManager.updateEventMain         = function () {
        let isBusy = oldBattleManagerUpdateEventMain.call(this);
        if (!isBusy) {
            LWP_InkManager.update();
            return LWP_InkManager.isActive();
        } else {
            return isBusy;
        }
    }

//////////////////////////////////////////////////////////////////
// Game_Interpreter - handling the plugin command that starts everything
//////////////////////////////////////////////////////////////////

    const oldGame_InterpreterPluginCommand   = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        if (/ink/i.test(command)) {
            const target = args[0];
            LWP_InkManager.go(target);
            this.setWaitMode('ink');
            return;
        }
        ;
        oldGame_InterpreterPluginCommand.call(this, command, args);
    };

    const oldGame_InterpreterUpdateWaitMode   = Game_Interpreter.prototype.updateWaitMode;
    Game_Interpreter.prototype.updateWaitMode = function () {
        if (this._waitMode === 'ink' && LWP_InkManager.isActive()) {
            return true;
        }
        return oldGame_InterpreterUpdateWaitMode.call(this);
    }

//////////////////////////////////////////////////////////////////
// DataManager
// for hooking into save/load
//////////////////////////////////////////////////////////////////
    const oldDataManagerMakeSaveContents = DataManager.makeSaveContents;
    DataManager.makeSaveContents         = function () {
        let contents     = oldDataManagerMakeSaveContents.call(this);
        contents.LWP_Ink = LWP_InkManager.makeSaveContents();
        return contents;
    }

    const oldDataManagerExtractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents         = function (contents) {
        oldDataManagerExtractSaveContents.call(this, contents);
        LWP_InkManager.extractSaveContents(contents.LWP_Ink);
    }

//////////////////////////////////////////////////////////////////
// Window_Base - allowing Ink to be called to supply text
// anywhere. In theory this includes output from Ink itself that
// is showing in a message window, but please don't do that! It
// may work, but it is not supported. It is intended for item
// names and descriptions, etc.
// It also does not support choices - if it finds a choice, it
// won't show it, only the text preceeding it.
// Ink shown this way also won't change state - it won't update
// "seen" counts, and it won't make any other changes to the Ink
// state. This is another reason why it shouldn't be used for
// message bog messages!
//////////////////////////////////////////////////////////////////

    const oldWindow_Base_convertEscapeCharacters  =
              Window_Base.prototype.convertEscapeCharacters;
    const inkAnywhereRegex                        = /\{ink:([^}]+)\}/ig;
    Window_Base.prototype.convertEscapeCharacters = function (text) {
        text          = oldWindow_Base_convertEscapeCharacters.call(this, text);
        let savedData = null;
        const story   = () => {
            const _story = LWP_InkManager.getStory();
            savedData    = _story ? _story.state.ToJson() : null;
            return _story;
        };
        text          = text.replace(inkAnywhereRegex, (match, inkAddress) => {
            LWP_InkManager.setInkPath(inkAddress);
            return LWP_InkManager.getNextContent(story());
        });
        if (savedData) {
            LWP_InkManager.getStory().state.LoadJson(savedData);
        }
        return text;
    };

//////////////////////////////////////////////////////////////////
// filesystem - utility functions. Not exposed externally.
//////////////////////////////////////////////////////////////////

    function getExtension(filename) {
        const dot = filename.lastIndexOf('.');
        if (dot === -1) return '';
        return filename.substring(dot + 1, filename.length);
    }

    function arrayify(maybeAnArrayOrMaybeNot) {
        if (Array.isArray(maybeAnArrayOrMaybeNot)) {
            return maybeAnArrayOrMaybeNot;
        } else {
            return [maybeAnArrayOrMaybeNot];
        }
    }

    const _listInPath_cache = {};

    function listInPath(dir, allowedFileTypes) {
        // TODO: 'fs' is not allowed in web deployments, which mobile uses, and there are no APIs
        // available to do a directory listing. The accepted method is to build a cache of available
        // files when run in test mode in the RMMV editor, and save that to a data file, and scan
        // that file instead of the actual directory.
        // Since this is only used for detecting face images, this could be made relatively simply.
        allowedFileTypes = arrayify(allowedFileTypes);
        const key        = dir + ':' + allowedFileTypes.join(',');
        let cachedValue  = _listInPath_cache[key];
        if (cachedValue === undefined) {
            allowedFileTypes = allowedFileTypes.map(x => x.toLowerCase());
            const fs         = require('fs');
            const path       = require('path');
            const base       = path.dirname(process.mainModule.filename);
            const fullpath   = path.join(base, dir);
            const entries    = fs.readdirSync(fullpath);
            if (allowedFileTypes) {
                cachedValue = entries
                    .filter(filename => allowedFileTypes.indexOf(getExtension(filename).toLowerCase()) !== -1)
                    .map(filename => filename.substring(0, filename.lastIndexOf('.')));
            } else {
                cachedValue = entries;
            }
            _listInPath_cache[key] = cachedValue;
        }
        return cachedValue;
    }

})();
