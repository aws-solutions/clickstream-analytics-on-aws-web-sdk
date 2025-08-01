# AWS Solution Clickstream Analytics SDK for Web

## Introduction

Clickstream Web SDK can help you easily collect and report events from browser to AWS. This SDK is part of an AWS solution - [Clickstream Analytics on AWS](https://github.com/aws-solutions/clickstream-analytics-on-aws), which provisions data pipeline to ingest and process event data into AWS services such as S3, Redshift.

The SDK relies on the Amplify for JS SDK Core Library and is developed according to the Amplify AnalyticsProvider interface. In addition, we've added features that automatically collect common user events and attributes (e.g., page view, first open) to simplify data collection for users.

Visit our [Documentation site](https://aws-solutions.github.io/clickstream-analytics-on-aws/en/latest/sdk-manual/web/) to learn more about Clickstream Web SDK.

## Integrate SDK

### Include SDK

```bash
$ npm install @aws/clickstream-web
```

### Initialize the SDK
Copy your configuration code from your clickstream solution web console, we recommended you add the code to your app's root entry point, for example `index.js/app.tsx` in React or `main.ts` in Vue/Angular, the configuration code should look like as follows. You can also manually add this code snippet and replace the values of appId and endpoint after you registered app to a data pipeline in the Clickstream Analytics solution console.

```typescript
import { ClickstreamAnalytics } from '@aws/clickstream-web';

ClickstreamAnalytics.init({
   appId: "your appId",
   endpoint: "https://example.com/collect",
});
```

Your `appId` and `endpoint` are already set up in it.

### Start using

#### Record event

Add the following code where you need to record event.

```typescript
import { ClickstreamAnalytics } from '@aws/clickstream-web';

// record event with attributes
ClickstreamAnalytics.record({
  name: 'button_click',
  attributes: {
    event_category: 'shoes',
    currency: 'CNY',
    value: 279.9,
  }
});

//record event with name
ClickstreamAnalytics.record({ name: 'button_click' });
```

#### Login and logout

```typescript
import { ClickstreamAnalytics } from '@aws/clickstream-web';

// when user login success.
ClickstreamAnalytics.setUserId("UserId");

// when user logout
ClickstreamAnalytics.setUserId(null);
```

#### Add user attribute

```typescript
ClickstreamAnalytics.setUserAttributes({
  userName:"carl",
  userAge: 22
});
```

When opening for the first time after integrating the SDK, you need to manually set the user attributes once, and current login user's attributes will be cached in localStorage, so the next time browser open you don't need to set all user's attribute again, of course you can use the same api `ClickstreamAnalytics.setUserAttributes()` to update the current user's attribute when it changes.

#### Add global attribute
1. Add global attributes when initializing the SDK

   The following example code shows how to add traffic source fields as global attributes when initializing the SDK.

   ```typescript
   import { ClickstreamAnalytics, Attr } from '@aws/clickstream-web';
   
   ClickstreamAnalytics.init({
      appId: "your appId",
      endpoint: "https://example.com/collect",
      globalAttributes:{
        [Attr.TRAFFIC_SOURCE_SOURCE]: 'amazon',
        [Attr.TRAFFIC_SOURCE_MEDIUM]: 'cpc',
        [Attr.TRAFFIC_SOURCE_CAMPAIGN]: 'summer_promotion',
        [Attr.TRAFFIC_SOURCE_CAMPAIGN_ID]: 'summer_promotion_01',
        [Attr.TRAFFIC_SOURCE_TERM]: 'running_shoes',
        [Attr.TRAFFIC_SOURCE_CONTENT]: 'banner_ad_1',
        [Attr.TRAFFIC_SOURCE_CLID]: 'amazon_ad_123',
        [Attr.TRAFFIC_SOURCE_CLID_PLATFORM]: 'amazon_ads',
      }
   });
   ```

2. Add global attributes after initializing the SDK

   ``` typescript
   import { ClickstreamAnalytics, Attr } from '@aws/clickstream-web';
   
   ClickstreamAnalytics.setGlobalAttributes({
     [Attr.TRAFFIC_SOURCE_MEDIUM]: "Search engine",
     level: 10,
   });
   ```

It is recommended to set global attributes when initializing the SDK, global attributes will be included in all events that occur after it is set, you also can remove a global attribute by setting its value to `null`.

#### Record event with items

You can add the following code to log an event with an item.

**Note: Only pipelines from version 1.1+ can handle items with custom attribute.**

```typescript
import { ClickstreamAnalytics, Item, Attr } from '@aws/clickstream-web';

const itemBook: Item = {
  id: '123',
  name: 'Nature',
  category: 'book',
  price: 99,
  book_publisher: "Nature Research",
};
ClickstreamAnalytics.record({
  name: 'view_item',
  attributes: {
    [Attr.CURRENCY]: 'USD', 
    [Attr.VALUE]: 99,
    event_category: 'recommended',
  },
  items: [itemBook],
});
```

#### Send event immediate in batch mode

When you are in batch mode, you can still send an event immediately by setting the `isImmediate` attribute, as in the following code:

```typescript
import { ClickstreamAnalytics } from '@aws/clickstream-web';

ClickstreamAnalytics.record({
  name: 'button_click',
  isImmediate: true,
});
```

#### Other configurations
In addition to the required `appId` and `endpoint`, you can configure other information to get more customized usage:

```typescript
import { ClickstreamAnalytics, EventMode, PageType } from '@aws/clickstream-web';

ClickstreamAnalytics.init({
   appId: "your appId",
   endpoint: "https://example.com/collect",
   sendMode: EventMode.Batch,
   sendEventsInterval: 5000,
   isTrackPageViewEvents: true,
   isTrackUserEngagementEvents: true,
   isTrackClickEvents: true,
   isTrackSearchEvents: true,
   isTrackScrollEvents: true,
   isTrackPageLoadEvents: true,
   isTrackAppStartEvents: true,
   isTrackAppEndEvents: true,
   pageType: PageType.SPA,
   isLogEvents: false,
   authCookie: "your auth cookie",
   sessionTimeoutDuration: 1800000,
   idleTimeoutDuration: 120000,
   searchKeyWords: ['product', 'class'],
   domainList: ['example1.com', 'example2.com'],
});
```

Here is an explanation of each property:

- **appId (Required)**: the app id of your project in control plane.
- **endpoint (Required)**: the endpoint path you will upload the event to AWS server.
- **sendMode**: EventMode.Immediate, EventMode.Batch, default is Immediate mode.
- **sendEventsInterval**: event sending interval millisecond, works only bath send mode, the default value is `5000`
- **isTrackPageViewEvents**: whether auto record page view events in browser, default is `true`
- **isTrackUserEngagementEvents**: whether auto record user engagement events in browser, default is `true`
- **isTrackClickEvents**: whether auto record link click events in browser, default is `true`
- **isTrackSearchEvents**: whether auto record search result page events in browser, default is `true`
- **isTrackScrollEvents**: whether auto record page scroll events in browser, default is `true`
- **isTrackPageLoadEvents**: whether auto record page load performance events in browser, default is `false`
- **isTrackAppStartEvents**: whether auto record app start events in browser when pages becomes visible, default is `false`
- **isTrackAppEndEvents**: whether auto record app end events in browser when pages becomes invisible, default is `false`
- **pageType**: the website type, `SPA` for single page application, `multiPageApp` for multiple page application, default is `SPA`. This attribute works only when the attribute `isTrackPageViewEvents`'s value is `true`
- **isLogEvents**: whether to print out event json for debugging, default is false.
- **authCookie**: your auth cookie for AWS application load balancer auth cookie.
- **sessionTimeoutDuration**: the duration for session timeout millisecond, default is 1800000
- **idleTimeoutDuration**: the maximum duration of user inactivity before triggering an idle state, default is 120000 millisecond, Any idle duration exceeding this threshold will be removed in the user_engagement events on the current page.
- **searchKeyWords**: the customized Keywords for trigger the `_search` event, by default we detect `q`, `s`, `search`, `query` and `keyword` in query parameters.
- **domainList**: if your website cross multiple domain, you can customize the domain list. The `_outbound` attribute of the `_click` event will be true when a link leads to a website that's not a part of your configured domain.  

#### Configuration update
You can update the default configuration after initializing the SDK, below are the additional configuration options you can customize.

```typescript
import { ClickstreamAnalytics } from '@aws/clickstream-web';

ClickstreamAnalytics.updateConfigure({
  isLogEvents: true,
  authCookie: 'your auth cookie',
  isTrackPageViewEvents: false,
  isTrackUserEngagementEvents: false,
  isTrackClickEvents: false,
  isTrackScrollEvents: false,
  isTrackSearchEvents: false,
  isTrackPageLoadEvents: false,
  isTrackAppStartEvents: true,
  isTrackAppEndEvents: true,
});
```

## Implementing Clickstream Web SDK in Google Tag Manager Using Template

1. Download the Clickstream SDK template file (.tpl) from the [SDK Release Page](https://github.com/aws-solutions/clickstream-analytics-on-aws-web-sdk/releases).
2. Refer to the Google Tag Manager [Import Guide](https://developers.google.com/tag-platform/tag-manager/templates#export_and_import) for instructions on importing the .tpl file as a custom template in your tag manager console.
3. Refer to the [Use your new tag](https://developers.google.com/tag-platform/tag-manager/templates#use_your_new_tag) to add ClickstreamAnalytics tag to your container.
4. The ClickstreamAnalytics tag currently supports four tag types:
   * Initialize SDK
   * Record Custom Event
   * Set User ID
   * Set User Attribute

   Note: Ensure that you initialize the SDK tag first before use other ClickstreamAnalytics tag types.

## How to integrate and test locally

### Integrate the `.tgz` file

Clone this repository locally and execute the following script to generate `aws-clickstream-web-0.12.6.tgz` zip package, which will be located in the project root folder.
```bash
$ cd clickstream-web && npm i && npm run pack
```

Copy the `aws-clickstream-web-0.12.6.tgz` into your project, then execute the script in your project root folder to install the SDK.
```bash
$ npm install ./aws-clickstream-web-0.12.6.tgz
```
**Note**: Please correct the SDK version and change the path to where the `aws-clickstream-web-0.12.6.tgz` file is located.

### Integrate the `clickstream-web.min.js` file
Execute the following script to generate `clickstream-web.min.js`, located in the `/dist` folder.
```bash
$ cd clickstream-web && npm i && npm run pack
```
Copy the `clickstream-web.min.js` into your project and add the following initial code into your `index.html`.

```html
<script src="clickstream-web.min.js"></script>
<script>
    window.ClickstreamAnalytics.init({
        appId: 'your appId',
        endpoint: 'https://example.com/collect',
        isLogEvents: true,
        pageType: window.PageType.SPA, //multiPageApp
        sendMode: window.SendMode.Batch, //Immediate
    })
</script>
```
You can also find the `clickstream-web.min.js` file in the [Release](https://github.com/aws-solutions/clickstream-analytics-on-aws-web-sdk/releases) page.

### Test

```bash
$ npm run test

# with lint
$ sh ./deployment/run-unit-tests.sh
```

## Collection of operational metrics

This solution collects anonymized operational metrics to help AWS improve the
quality of features of the solution. For more information, including how to disable
this capability, please see the [implementation guide](https://docs.aws.amazon.com/solutions/latest/clickstream-analytics-on-aws).

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the [Apache 2.0 License](./LICENSE).
