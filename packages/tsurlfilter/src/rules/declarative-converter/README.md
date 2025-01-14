# Table of contents
1. [Description](#description)
1. [MV3 specific limitations](#mv3_specific_limitations)
    1. [$document](#mv3_specific_limitations__$document)
    1. [$all](#mv3_specific_limitations__$all)
    1. [$removeparam](#mv3_specific_limitations__$removeparam)
    1. [$redirect-rule](#mv3_specific_limitations__$redirect-rule)
1. [Basic examples](#basic_examples)
1. [Basic modifiers](#basic_modifiers)
    1. [$domain](#basic_modifiers__$domain)
    1. [$third-party](#basic_modifiers__$third-party)
    1. [$popup](#basic_modifiers__$popup)
    1. [$match-case](#basic_modifiers__$match-case)
    1. [$header](#basic_modifiers__$header)
1. [Content type modifiers](#content_type_modifiers)
    1. [$document](#content_type_modifiers__$document)
    1. [$image](#content_type_modifiers__$image)
    1. [$stylesheet](#content_type_modifiers__$stylesheet)
    1. [$script](#content_type_modifiers__$script)
    1. [$object](#content_type_modifiers__$object)
    1. [$font](#content_type_modifiers__$font)
    1. [$media](#content_type_modifiers__$media)
    1. [$subdocument](#content_type_modifiers__$subdocument)
    1. [$ping](#content_type_modifiers__$ping)
    1. [$xmlhttprequest](#content_type_modifiers__$xmlhttprequest)
    1. [$websocket](#content_type_modifiers__$websocket)
    1. [$webrtc](#content_type_modifiers__$webrtc)
    1. [$other](#content_type_modifiers__$other)
1. [Exception rules modifiers](#exception_rules_modifiers)
    1. [$elemhide](#exception_rules_modifiers__$elemhide)
    1. [$content](#exception_rules_modifiers__$content)
    1. [$jsinject](#exception_rules_modifiers__$jsinject)
    1. [$urlblock](#exception_rules_modifiers__$urlblock)
    1. [$stealth](#exception_rules_modifiers__$stealth)
    1. [$generichide](#exception_rules_modifiers__$generichide)
    1. [$genericblock](#exception_rules_modifiers__$genericblock)
    1. [$specifichide](#exception_rules_modifiers__$specifichide)
1. [Advanced capabilities](#advanced_capabilities)
    1. [$important](#advanced_capabilities__$important)
    1. [$badfilter](#advanced_capabilities__$badfilter)
    1. [$replace](#advanced_capabilities__$replace)
    1. [$csp](#advanced_capabilities__$csp)
    1. [$all](#advanced_capabilities__$all)
    1. [$cookie](#advanced_capabilities__$cookie)
    1. [$redirect](#advanced_capabilities__$redirect)
    1. [$redirect-rule](#advanced_capabilities__$redirect-rule)
    1. [noop](#advanced_capabilities__noop)
    1. [$empty](#advanced_capabilities__$empty)
    1. [$denyallow](#advanced_capabilities__$denyallow)
    1. [$mp4](#advanced_capabilities__$mp4)
    1. [$removeparam](#advanced_capabilities__$removeparam)
    1. [$removeheader](#advanced_capabilities__$removeheader)
1. [Not supported in extension](#not_supported_in_extension)
    1. [$hls (not supported in extension)](#not_supported_in_extension__$hls_(not_supported_in_extension))
    1. [$jsonprune (not supported in extension)](#not_supported_in_extension__$jsonprune_(not_supported_in_extension))
    1. [$network (not supported in extension)](#not_supported_in_extension__$network_(not_supported_in_extension))
    1. [$app (not supported in extension)](#not_supported_in_extension__$app_(not_supported_in_extension))
    1. [$extension (not supported in extension)](#not_supported_in_extension__$extension_(not_supported_in_extension))
<a name="description"></a>
# Description
This file contains examples of converting filter rules to new MV3 declarative
rules and describes some MV3-specific limitations of the converted rules.
<br />
<br />

<a name="mv3_specific_limitations"></a>
# MV3 specific limitations
<a name="mv3_specific_limitations__$document"></a>
## $document
During convertion process $document modificator is expanded into
$elemhide, $content, $urlblock, $jsinject and $extension,
of which:
- $content - not supported in the MV3;
- $extension - not supported in extension;
- $elemhide, $jsinject - not implemented yet;
- $urlblock - converted not correctly (allow all requests not on the specified
url, but FROM specified url and also disables cosmetic rules).
So we still convert the $document-rules, but not 100% correctly.

<a name="mv3_specific_limitations__$all"></a>
## $all
To convert a $all rule, a network rule must be modified to accept multiple
modifiers from the same rule, for example, as it works with the
"multi"-modifier $document.

<a name="mv3_specific_limitations__$removeparam"></a>
## $removeparam
Groups of $removeparam rules with the same conditions are combined into one
rule only within one filter.

<a name="mv3_specific_limitations__$redirect-rule"></a>
## $redirect-rule
Works as $redirect
<br />
<br />

<a name="basic_examples"></a>
# Basic examples
Blocking by domain name

```adblock
||example.org^
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||example.org^",
			"isUrlFilterCaseSensitive": false
		},
		"priority": 1
	}
]

```
Blocking exact address

```adblock
|http://example.org/
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "|http://example.org/",
			"isUrlFilterCaseSensitive": false
		},
		"priority": 1
	}
]

```
Basic rule modifiers

```adblock
||example.org^$script,third-party,domain=example.com
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||example.org^",
			"domainType": "thirdParty",
			"initiatorDomains": [
				"example.com"
			],
			"resourceTypes": [
				"script"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 302
	}
]

```
Unblocking an address

```adblock
@@||example.org/banner
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "allow"
		},
		"condition": {
			"urlFilter": "||example.org/banner",
			"isUrlFilterCaseSensitive": false
		},
		"priority": 100001
	}
]

```
Unblocking everything on a website

```adblock
@@||example.org^$document
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "allowAllRequests"
		},
		"condition": {
			"urlFilter": "||example.org^",
			"resourceTypes": [
				"main_frame"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 140101
	}
]

```
Cosmetic rule will be ignored

```adblock
example.org##.banner
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
<br />
<br />

<a name="basic_modifiers"></a>
# Basic modifiers
<a name="basic_modifiers__$domain"></a>
## $domain
<b>Status</b>: partial supported
<br/>
<b>MV3 limitations:</b>
<br/>
Doesn't support regexps and any tld domains
<br/>
<b>Examples:</b>
<br/>
example 1

```adblock
||baddomain.com^$domain=example.org
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||baddomain.com^",
			"initiatorDomains": [
				"example.org"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 201
	}
]

```
example 2

```adblock
||baddomain.com^$domain=example.org|example.com
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||baddomain.com^",
			"initiatorDomains": [
				"example.org",
				"example.com"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 151
	}
]

```
example 3

```adblock
||baddomain.com^$domain=~example.org
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||baddomain.com^",
			"excludedInitiatorDomains": [
				"example.org"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 2
	}
]

```
example 4

```adblock
||baddomain.com^$domain=example.org|~foo.example.org
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||baddomain.com^",
			"initiatorDomains": [
				"example.org"
			],
			"excludedInitiatorDomains": [
				"foo.example.org"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 202
	}
]

```
example 5

```adblock
||baddomain.com^$domain=/(^\\|.+\\.)example\\.(com\\|org)\\$/
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||baddomain.com^",
			"initiatorDomains": [
				"/(^\\\\",
				".+\\\\.)example\\\\.(com\\\\",
				"org)\\\\$/"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 135
	}
]

```
example 6

```adblock
||baddomain.com^$domain=~a.com|~b.*|~/(^\\|.+\\.)c\\.(com\\|org)\\$/
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||baddomain.com^",
			"initiatorDomains": [
				".+\\\\.)c\\\\.(com\\\\",
				"org)\\\\$/"
			],
			"excludedInitiatorDomains": [
				"a.com",
				"b.*",
				"/(^\\\\"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 152
	}
]

```
example 7

```adblock
*$cookie,domain=example.org|example.com
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 8

```adblock
*$document,domain=example.org|example.com
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "*",
			"initiatorDomains": [
				"example.org",
				"example.com"
			],
			"resourceTypes": [
				"main_frame"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 251
	}
]

```
example 9

```adblock
page$domain=example.org
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "page",
			"initiatorDomains": [
				"example.org"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 201
	}
]

```
example 10

```adblock
page$domain=targetdomain.com
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "page",
			"initiatorDomains": [
				"targetdomain.com"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 201
	}
]

```
example 11

```adblock
||*page$domain=targetdomain.com
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "*page",
			"initiatorDomains": [
				"targetdomain.com"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 201
	}
]

```
example 12

```adblock
||*page$domain=targetdomain.com,cookie
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 13

```adblock
/banner\d+/$domain=targetdomain.com
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"regexFilter": "/banner\\d+/",
			"initiatorDomains": [
				"targetdomain.com"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 201
	}
]

```
example 14

```adblock
page$domain=targetdomain.com|~example.org
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "page",
			"initiatorDomains": [
				"targetdomain.com"
			],
			"excludedInitiatorDomains": [
				"example.org"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 202
	}
]

```
<a name="basic_modifiers__$third-party"></a>
## $third-party
<b>Status</b>: supported
<br/>
<b>Examples:</b>
<br/>
example 1

```adblock
||domain.com^$third-party
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||domain.com^",
			"domainType": "thirdParty",
			"isUrlFilterCaseSensitive": false
		},
		"priority": 2
	}
]

```
example 2

```adblock
||domain.com$~third-party
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||domain.com",
			"domainType": "firstParty",
			"isUrlFilterCaseSensitive": false
		},
		"priority": 2
	}
]

```
<a name="basic_modifiers__$popup"></a>
## $popup
<b>Status</b>: partial support
<br/>
<b>MV3 limitations:</b>
<br/>
Cannot be converted to MV3 Declarative Rule, but maybe can be implemented on
the content-script side
<br/>
Bug: currently converted to simple blocking rules
<br/>
<b>Examples:</b>
<br/>

```adblock
||domain.com^$popup
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
<a name="basic_modifiers__$match-case"></a>
## $match-case
<b>Status</b>: supported
<br/>
<b>Examples:</b>
<br/>

```adblock
*/BannerAd.gif$match-case
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "*/BannerAd.gif",
			"isUrlFilterCaseSensitive": true
		},
		"priority": 2
	}
]

```
<a name="basic_modifiers__$header"></a>
## $header
<b>Status</b>: not supported
<br/>
<b>MV3 limitations:</b>
<br/>
Cannot be converted to MV3 Declarative Rule
<br/>
<b>Examples:</b>
<br/>
example 1

```adblock
||example.com^$header=set-cookie:foo
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 2

```adblock
||example.com^$header=set-cookie
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 3

```adblock
@@||example.com^$header=set-cookie:/foo\, bar\$/
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 4

```adblock
@@||example.com^$header=set-cookie
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
<br />
<br />

<a name="content_type_modifiers"></a>
# Content type modifiers
<b>Status</b>: all content type modifiers supported, except deprecated $webrtc
and $object-subrequest
<br/>
<b>Examples:</b>
<br/>
example 1

```adblock
||example.org^$image
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||example.org^",
			"resourceTypes": [
				"image"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 101
	}
]

```
example 2

```adblock
||example.org^$script,stylesheet
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||example.org^",
			"resourceTypes": [
				"stylesheet",
				"script"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 76
	}
]

```
example 3

```adblock
||example.org^$~image,~script,~stylesheet
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||example.org^",
			"excludedResourceTypes": [
				"stylesheet",
				"script",
				"image"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 2
	}
]

```
<a name="content_type_modifiers__$document"></a>
## $document
example 1

```adblock
@@||example.com^$document
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "allowAllRequests"
		},
		"condition": {
			"urlFilter": "||example.com^",
			"resourceTypes": [
				"main_frame"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 140101
	}
]

```
example 2

```adblock
@@||example.com^$document,~extension
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "allowAllRequests"
		},
		"condition": {
			"urlFilter": "||example.com^",
			"resourceTypes": [
				"main_frame"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 140101
	}
]

```
example 3

```adblock
||example.com^$document
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||example.com^",
			"resourceTypes": [
				"main_frame"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 101
	}
]

```
example 4

```adblock
||example.com^$document,redirect=noopframe
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "redirect",
			"redirect": {
				"extensionPath": "/path/to/resources/noopframe.html"
			}
		},
		"condition": {
			"urlFilter": "||example.com^",
			"resourceTypes": [
				"main_frame"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 1101
	}
]

```
example 5

```adblock
||example.com^$document,removeparam=test
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "redirect",
			"redirect": {
				"transform": {
					"queryTransform": {
						"removeParams": [
							"test"
						]
					}
				}
			}
		},
		"condition": {
			"urlFilter": "||example.com^",
			"resourceTypes": [
				"main_frame"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 101
	}
]

```
example 6

```adblock
||example.com^$document,replace=/test1/test2/
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
<a name="content_type_modifiers__$image"></a>
## $image

```adblock
||example.org^$image
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||example.org^",
			"resourceTypes": [
				"image"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 101
	}
]

```
<a name="content_type_modifiers__$stylesheet"></a>
## $stylesheet

```adblock
||example.org^$stylesheet
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||example.org^",
			"resourceTypes": [
				"stylesheet"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 101
	}
]

```
<a name="content_type_modifiers__$script"></a>
## $script

```adblock
||example.org^$script
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||example.org^",
			"resourceTypes": [
				"script"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 101
	}
]

```
<a name="content_type_modifiers__$object"></a>
## $object

```adblock
||example.org^$object
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||example.org^",
			"resourceTypes": [
				"object"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 101
	}
]

```
<a name="content_type_modifiers__$font"></a>
## $font

```adblock
||example.org^$font
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||example.org^",
			"resourceTypes": [
				"font"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 101
	}
]

```
<a name="content_type_modifiers__$media"></a>
## $media

```adblock
||example.org^$media
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||example.org^",
			"resourceTypes": [
				"media"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 101
	}
]

```
<a name="content_type_modifiers__$subdocument"></a>
## $subdocument
example 1

```adblock
||example.com^$subdocument
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||example.com^",
			"resourceTypes": [
				"sub_frame"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 101
	}
]

```
example 2

```adblock
||example.com^$subdocument,domain=domain.com
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||example.com^",
			"initiatorDomains": [
				"domain.com"
			],
			"resourceTypes": [
				"sub_frame"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 301
	}
]

```
<a name="content_type_modifiers__$ping"></a>
## $ping

```adblock
||example.org^$ping
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||example.org^",
			"resourceTypes": [
				"ping"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 101
	}
]

```
<a name="content_type_modifiers__$xmlhttprequest"></a>
## $xmlhttprequest

```adblock
||example.org^$xmlhttprequest
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||example.org^",
			"resourceTypes": [
				"xmlhttprequest"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 101
	}
]

```
<a name="content_type_modifiers__$websocket"></a>
## $websocket

```adblock
||example.org^$websocket
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||example.org^",
			"resourceTypes": [
				"websocket"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 101
	}
]

```
<a name="content_type_modifiers__$webrtc"></a>
## $webrtc
<b>Status</b>: not supported
<br/>
example 1

```adblock
||example.com^$webrtc,domain=example.org
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 2

```adblock
@@*$webrtc,domain=example.org
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
<a name="content_type_modifiers__$other"></a>
## $other

```adblock
||example.org^$other
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||example.org^",
			"resourceTypes": [
				"other"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 101
	}
]

```
<br />
<br />

<a name="exception_rules_modifiers"></a>
# Exception rules modifiers
<a name="exception_rules_modifiers__$elemhide"></a>
## $elemhide
<b>Status</b>: not implemented yet
<br/>
<b>MV3 limitations:</b>
<br/>
Not convertible to DNR in MV3, but uses tsurlfilter's [CosmeticEngine](https://github.com/AdguardTeam/tsurlfilter/blob/epic/tswebextension/packages/tsurlfilter/src/engine/cosmetic-engine/cosmetic-engine.ts#L15) for work
<br/>
<b>Examples:</b>
<br/>

```adblock
@@||example.com^$elemhide
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
<a name="exception_rules_modifiers__$content"></a>
## $content
<b>Status</b>: not implemented yet
<br/>
<b>MV3 limitations:</b>
<br/>
Bug: currently converted to allowAllRequests rules
<br/>
<b>Examples:</b>
<br/>

```adblock
@@||example.com^$content
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
<a name="exception_rules_modifiers__$jsinject"></a>
## $jsinject
<b>Status</b>: not implemented yet
<br/>
<b>Examples:</b>
<br/>

```adblock
@@||example.com^$jsinject
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
<a name="exception_rules_modifiers__$urlblock"></a>
## $urlblock
<b>Status</b>: not implemented yet
<br/>
<b>MV3 limitations:</b>
<br/>
Bug: uses urlFilter instead of initiatorDomains
<br/>
Bug: incorrect priority
<br/>
Bug: disables cosmetic rules
<br/>
<b>Examples:</b>
<br/>

```adblock
@@||example.com^$urlblock
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
<a name="exception_rules_modifiers__$stealth"></a>
## $stealth
<b>Status</b>: not implemented yet
<br/>
<b>Examples:</b>
<br/>
example 1

```adblock
@@||example.com^$stealth
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 2

```adblock
@@||domain.com^$script,stealth,domain=example.com
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
<a name="exception_rules_modifiers__$generichide"></a>
## $generichide
<b>Status</b>: not implemented yet
<br/>
<b>Examples:</b>
<br/>

```adblock
@@||example.com^$generichide
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
<a name="exception_rules_modifiers__$genericblock"></a>
## $genericblock
<b>Status</b>: not implemented yet
<br/>
<b>Examples:</b>
<br/>

```adblock
@@||example.com^$genericblock
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
<a name="exception_rules_modifiers__$specifichide"></a>
## $specifichide
<b>Status</b>: not implemented yet
<br/>
<b>Examples:</b>
<br/>

```adblock
@@||example.org^$specifichide
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
<br />
<br />

<a name="advanced_capabilities"></a>
# Advanced capabilities
<a name="advanced_capabilities__$important"></a>
## $important
<b>Status</b>: supported
<br/>
<b>Examples:</b>
<br/>
example 1.
blocking rule will block all requests despite of the exception rule

```adblock
||example.org^$important
@@||example.org^
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||example.org^",
			"isUrlFilterCaseSensitive": false
		},
		"priority": 1000001
	},
	{
		"id": 2,
		"action": {
			"type": "allow"
		},
		"condition": {
			"urlFilter": "||example.org^",
			"isUrlFilterCaseSensitive": false
		},
		"priority": 100001
	}
]

```
example 2.
if the exception rule also has `$important` modifier it will prevail,
so no requests will not be blocked

```adblock
||example.org^$important
@@||example.org^$important
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||example.org^",
			"isUrlFilterCaseSensitive": false
		},
		"priority": 1000001
	},
	{
		"id": 2,
		"action": {
			"type": "allow"
		},
		"condition": {
			"urlFilter": "||example.org^",
			"isUrlFilterCaseSensitive": false
		},
		"priority": 1100001
	}
]

```
example 3.
if a document-level exception rule is applied to the document,
the `$important` modifier will be ignored;
so if a request to `example.org` is sent from the `test.org` domain,
the blocking rule will not be applied despite it has the `$important` modifier

```adblock
||example.org^$important
@@||test.org^$document
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||example.org^",
			"isUrlFilterCaseSensitive": false
		},
		"priority": 1000001
	},
	{
		"id": 2,
		"action": {
			"type": "allowAllRequests"
		},
		"condition": {
			"urlFilter": "||test.org^",
			"resourceTypes": [
				"main_frame"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 140101
	}
]

```
<a name="advanced_capabilities__$badfilter"></a>
## $badfilter
<b>Status</b>: partial support
<br/>
<b>MV3 limitations:</b>
<br/>
Works only within the scope of one static filter or within the scope of all
dynamic rules (custom filters with user rules).
<br/>
<b>Examples:</b>
<br/>
example 1

```adblock
||example.com
||example.com$badfilter
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 2

```adblock
||example.com,image
||example.com$image,badfilter
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||example.com,image",
			"isUrlFilterCaseSensitive": false
		},
		"priority": 1
	}
]

```
example 3

```adblock
@@||example.com
@@||example.com$badfilter
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 4

```adblock
||example.com$domain=domain.com
||example.com$domain=domain.com,badfilter
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 5

```adblock
/some$domain=example.com|example.org|example.io
/some$domain=example.com,badfilter
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 6

```adblock
/some$domain=example.com|example.org|example.io
/some$domain=example.com|example.org,badfilter
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 7

```adblock
/some$domain=example.com|example.org
/some$domain=example.com|example.org|example.io,badfilter
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 8

```adblock
/some$domain=example.com|example.org|example.io
/some$domain=example.*,badfilter
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "/some",
			"initiatorDomains": [
				"example.com",
				"example.org",
				"example.io"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 135
	}
]

```
example 9

```adblock
/some$domain=example.*
/some$domain=example.com|example.org,badfilter
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "/some",
			"initiatorDomains": [
				"example.*"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 201
	}
]

```
example 10

```adblock
/some$domain=example.com|example.org|example.io
/some$domain=example.com|~example.org,badfilter
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "/some",
			"initiatorDomains": [
				"example.com",
				"example.org",
				"example.io"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 135
	}
]

```
<a name="advanced_capabilities__$replace"></a>
## $replace
<b>Status</b>: not supported
<br/>
<b>Examples:</b>
<br/>
example 1

```adblock
||example.org^$replace=/(<VAST[\s\S]*?>)[\s\S]*<\/VAST>/\$1<\/VAST>/i
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 2

```adblock
||example.org^$replace=/X/Y/
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 3

```adblock
||example.org^$replace=/Z/Y/
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 4

```adblock
@@||example.org/page/*$replace=/Z/Y/
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
<a name="advanced_capabilities__$csp"></a>
## $csp
<b>Status</b>: not implemented yet
<br/>
<b>Examples:</b>
<br/>
example 1

```adblock
||example.org^$csp=frame-src 'none'
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 2

```adblock
@@||example.org/page/*$csp=frame-src 'none'
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 3

```adblock
@@||example.org/page/*$csp
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 4

```adblock
||example.org^$csp=script-src 'self' 'unsafe-eval' http: https:
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 5

```adblock
||example.org^$csp=script-src 'self' 'unsafe-eval' http: https:
@@||example.org^$document
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 2,
		"action": {
			"type": "allowAllRequests"
		},
		"condition": {
			"urlFilter": "||example.org^",
			"resourceTypes": [
				"main_frame"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 140101
	}
]

```
<a name="advanced_capabilities__$all"></a>
## $all
<b>Status</b>: not implemented yet
<br/>
<b>Examples:</b>
<br/>

```adblock
||example.org^$all
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||example.org^",
			"resourceTypes": [
				"main_frame",
				"sub_frame",
				"stylesheet",
				"script",
				"image",
				"font",
				"object",
				"xmlhttprequest",
				"ping",
				"media",
				"websocket",
				"other"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 56
	}
]

```
<a name="advanced_capabilities__$cookie"></a>
## $cookie
<b>Status</b>: not implemented yet
<br/>
<b>Examples:</b>
<br/>
example 1

```adblock
||example.org^$cookie=NAME;maxAge=3600;sameSite=lax
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 2

```adblock
||example.org^$cookie
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 3

```adblock
||example.org^$cookie=NAME
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 4

```adblock
||example.org^$cookie=/regexp/
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 5

```adblock
@@||example.org^$cookie
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 6

```adblock
@@||example.org^$cookie=NAME
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 7

```adblock
@@||example.org^$cookie=/regexp/
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 8

```adblock
$cookie=__cfduid
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 9

```adblock
$cookie=/__utm[a-z]/
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 10

```adblock
||facebook.com^$third-party,cookie=c_user
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||facebook.com^",
			"domainType": "thirdParty",
			"isUrlFilterCaseSensitive": false
		},
		"priority": 2
	}
]

```
<a name="advanced_capabilities__$redirect"></a>
## $redirect
<b>Status</b>: partial support
<br/>
<b>MV3 limitations:</b>
<br/>
Allowlist rules are not supported
<br/>
<b>Examples:</b>
<br/>
example 1

```adblock
||example.org/script.js$script,redirect=noopjs
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "redirect",
			"redirect": {
				"extensionPath": "/path/to/resources/noopjs.js"
			}
		},
		"condition": {
			"urlFilter": "||example.org/script.js",
			"resourceTypes": [
				"script"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 1101
	}
]

```
example 2

```adblock
||example.org/test.mp4$media,redirect=noopmp4-1s
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "redirect",
			"redirect": {
				"extensionPath": "/path/to/resources/noopmp4.mp4"
			}
		},
		"condition": {
			"urlFilter": "||example.org/test.mp4",
			"resourceTypes": [
				"media"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 1101
	}
]

```
example 3

```adblock
@@||example.org^$redirect
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 4

```adblock
@@||example.org^$redirect=noopjs
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 5

```adblock
||*/redirect-test.css$redirect=noopcss
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "redirect",
			"redirect": {
				"extensionPath": "/path/to/resources/noopcss.css"
			}
		},
		"condition": {
			"urlFilter": "*/redirect-test.css",
			"isUrlFilterCaseSensitive": false
		},
		"priority": 1001
	}
]

```
example 6

```adblock
||*/redirect-test.js$redirect=noopjs
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "redirect",
			"redirect": {
				"extensionPath": "/path/to/resources/noopjs.js"
			}
		},
		"condition": {
			"urlFilter": "*/redirect-test.js",
			"isUrlFilterCaseSensitive": false
		},
		"priority": 1001
	}
]

```
example 7

```adblock
||*/redirect-test.png$redirect=2x2-transparent.png
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "redirect",
			"redirect": {
				"extensionPath": "/path/to/resources/2x2-transparent.png"
			}
		},
		"condition": {
			"urlFilter": "*/redirect-test.png",
			"isUrlFilterCaseSensitive": false
		},
		"priority": 1001
	}
]

```
example 8

```adblock
||*/redirect-test.html$redirect=noopframe
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "redirect",
			"redirect": {
				"extensionPath": "/path/to/resources/noopframe.html"
			}
		},
		"condition": {
			"urlFilter": "*/redirect-test.html",
			"isUrlFilterCaseSensitive": false
		},
		"priority": 1001
	}
]

```
example 9

```adblock
||*/redirect-test.txt$redirect=nooptext
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "redirect",
			"redirect": {
				"extensionPath": "/path/to/resources/nooptext.js"
			}
		},
		"condition": {
			"urlFilter": "*/redirect-test.txt",
			"isUrlFilterCaseSensitive": false
		},
		"priority": 1001
	}
]

```
example 10

```adblock
||*/redirect-exception-test.js$redirect=noopjs
@@||*/redirect-exception-test.js
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "redirect",
			"redirect": {
				"extensionPath": "/path/to/resources/noopjs.js"
			}
		},
		"condition": {
			"urlFilter": "*/redirect-exception-test.js",
			"isUrlFilterCaseSensitive": false
		},
		"priority": 1001
	},
	{
		"id": 2,
		"action": {
			"type": "allow"
		},
		"condition": {
			"urlFilter": "*/redirect-exception-test.js",
			"isUrlFilterCaseSensitive": false
		},
		"priority": 100001
	}
]

```
example 11

```adblock
||*/redirect-priority-test.js$redirect=noopjs
||*/redirect-priority-test.js$important,csp=script-src 'self'
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "redirect",
			"redirect": {
				"extensionPath": "/path/to/resources/noopjs.js"
			}
		},
		"condition": {
			"urlFilter": "*/redirect-priority-test.js",
			"isUrlFilterCaseSensitive": false
		},
		"priority": 1001
	},
	{
		"id": 2,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "*/redirect-priority-test.js",
			"isUrlFilterCaseSensitive": false
		},
		"priority": 1000001
	}
]

```
<a name="advanced_capabilities__$redirect-rule"></a>
## $redirect-rule
<b>Status</b>: not supported
<br/>
<b>MV3 limitations:</b>
<br/>
Converting as $redirect rules
<br/>
<b>Examples:</b>
<br/>

```adblock
||example.org/script.js
||example.org^$redirect-rule=noopjs
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||example.org/script.js",
			"isUrlFilterCaseSensitive": false
		},
		"priority": 1
	},
	{
		"id": 2,
		"action": {
			"type": "redirect",
			"redirect": {
				"extensionPath": "/path/to/resources/noopjs.js"
			}
		},
		"condition": {
			"urlFilter": "||example.org^",
			"isUrlFilterCaseSensitive": false
		},
		"priority": 1001
	}
]

```
<a name="advanced_capabilities__noop"></a>
## noop
<b>Status</b>: supported
<br/>
<b>Examples:</b>
<br/>

```adblock
||example.com$_,removeparam=/^ss\\$/,_,image
||example.com$domain=example.org,___,~third-party
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 2,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||example.com",
			"domainType": "firstParty",
			"initiatorDomains": [
				"example.org"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 202
	}
]

```
<a name="advanced_capabilities__$empty"></a>
## $empty
<b>Status</b>: implemented not correct, deprecated
<br/>
<b>MV3 limitations:</b>
<br/>
Converted as simple blocking rule.
<br/>
<b>Examples:</b>
<br/>
example 1.
returns an empty response to all requests to example.org and all subdomains.

```adblock
||example.org^$empty
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||example.org^",
			"isUrlFilterCaseSensitive": false
		},
		"priority": 1
	}
]

```
<a name="advanced_capabilities__$denyallow"></a>
## $denyallow
<b>Status</b>: supported
<br/>
<b>Examples:</b>
<br/>

```adblock
*$script,domain=a.com|b.com,denyallow=x.com|y.com
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "*",
			"initiatorDomains": [
				"a.com",
				"b.com"
			],
			"excludedRequestDomains": [
				"x.com",
				"y.com"
			],
			"resourceTypes": [
				"script"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 252
	}
]

```
<a name="advanced_capabilities__$mp4"></a>
## $mp4
<b>Status</b>: not implemented yet, deprecated
<br/>
<b>Examples:</b>
<br/>
example 1.
block a video downloads from ||example.com/videos/* and changes the response to a video placeholder.

```adblock
||example.com/videos/$mp4
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "block"
		},
		"condition": {
			"urlFilter": "||example.com/videos/",
			"isUrlFilterCaseSensitive": false
		},
		"priority": 1
	}
]

```
<a name="advanced_capabilities__$removeparam"></a>
## $removeparam
<b>Status</b>: partial support
<br/>
<b>MV3 limitations:</b>
<br/>
Regexps, negation and allow-rules are not supported
<br/>
Rules with the same matching condition are combined into one, but only within
the scope of one static filter or within the scope of all dynamic rules
(custom filters with user rules).
<br/>
<b>Examples:</b>
<br/>
example 1.
skip rules with a negation, or regexp or the rule is a allowlist

```adblock
||example.org^$removeparam
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "redirect",
			"redirect": {
				"transform": {
					"query": ""
				}
			}
		},
		"condition": {
			"urlFilter": "||example.org^",
			"isUrlFilterCaseSensitive": false
		},
		"priority": 1
	}
]

```
example 2

```adblock
$removeparam=~param
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 3

```adblock
$removeparam=~/regexp/
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 4

```adblock
@@||example.org^$removeparam
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 5

```adblock
@@||example.org^$removeparam=param
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 6

```adblock
@@||example.org^$removeparam=/regexp/
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 7

```adblock
$removeparam=/^(utm_source|utm_medium|utm_term)=/
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 8

```adblock
$removeparam=/^(utm_content|utm_campaign|utm_referrer)=/
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 9.
Group of similar remove param rules will be combined into one

```adblock
||testcases.adguard.com$xmlhttprequest,removeparam=p1case1
||testcases.adguard.com$xmlhttprequest,removeparam=p2case1
||testcases.adguard.com$xmlhttprequest,removeparam=P3Case1
$xmlhttprequest,removeparam=p1case2
```

↓↓↓↓ converted to ↓↓↓↓

```json
[
	{
		"id": 1,
		"action": {
			"type": "redirect",
			"redirect": {
				"transform": {
					"queryTransform": {
						"removeParams": [
							"p1case1",
							"p2case1",
							"P3Case1"
						]
					}
				}
			}
		},
		"condition": {
			"urlFilter": "||testcases.adguard.com",
			"resourceTypes": [
				"xmlhttprequest"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 101
	},
	{
		"id": 4,
		"action": {
			"type": "redirect",
			"redirect": {
				"transform": {
					"queryTransform": {
						"removeParams": [
							"p1case2"
						]
					}
				}
			}
		},
		"condition": {
			"resourceTypes": [
				"xmlhttprequest"
			],
			"isUrlFilterCaseSensitive": false
		},
		"priority": 101
	}
]

```
<a name="advanced_capabilities__$removeheader"></a>
## $removeheader
<b>Status</b>: not implemented yet
<br/>
<b>Examples:</b>
<br/>
example 1

```adblock
||example.org^$removeheader=header-name
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 2

```adblock
||example.org^$removeheader=request:header-name
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 3

```adblock
@@||example.org^$removeheader
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 4

```adblock
@@||example.org^$removeheader=header
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 5

```adblock
||example.org^$removeheader=refresh
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
example 6

```adblock
||example.org^$removeheader=request:x-client-data
```

↓↓↓↓ converted to ↓↓↓↓

```json
[]

```
<a name="not_supported_in_extension"></a>
# Not supported in extension
<a name="not_supported_in_extension__$hls_(not_supported_in_extension)"></a>
## $hls (not supported in extension)
<a name="not_supported_in_extension__$jsonprune_(not_supported_in_extension)"></a>
## $jsonprune (not supported in extension)
<a name="not_supported_in_extension__$network_(not_supported_in_extension)"></a>
## $network (not supported in extension)
<a name="not_supported_in_extension__$app_(not_supported_in_extension)"></a>
## $app (not supported in extension)
<a name="not_supported_in_extension__$extension_(not_supported_in_extension)"></a>
## $extension (not supported in extension)