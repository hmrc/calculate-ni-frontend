# calculate-ni-frontend

# Table of Contents

* Calculations 
  * [Class 1 contributions](#class-1-contributions)
  * [Directors](#directors)
  * [Unofficial Deferment](#unofficial-deferment)
* Project Structure
  * [SBT Setup](#sbt-setup)
  * [Common](#common)
  * [Microservice](#microservice)
  * [React](#react)
  * [Frontend](#frontend)
* [Licence](#license)

# Calculations

## Class 1 contributions

Class contributions are split between **primary** contributions which are payable by employees and **secondary** 
contributions  which are payable by employers. The amount of contributions depends on how much the employee earns. In general,
an employee's earnings in their earnings period (e.g. monthly or weekly) are divided across different bands and contributions 
are calculated as a set percentage (rate) of the amount of earnings within each band. Each band has its own primary and 
secondary rate which depend on an individual's circumstances which is captured in a person's category letter. The band limits generally change
each tax year. 

Comprehensive documentation about Class 1 NICs can be found under the public HMRC internal manuals 
[here](https://www.gov.uk/hmrc-internal-manuals/national-insurance-manual/nim01000co).

Additional information can also be found in the CGW2 booklets published by HMRC and the
[National Insurance Guidance for software developers](https://www.gov.uk/government/publications/payroll-technical-specifications-national-insurance).


## Directors

The directors calculator calculates class 1 NICs for directors. The calculation largely follows the same rules for calculating
non-directors class 1 NICs except that earnings period is different. For directors, the earnings period is either annual 
or pro-rata annual.

The calculator allows multiple income sources to be input for a director's annual earnings period. Earnings under different
category letters follow an order of precedence. For example, if a director had earnings under both category `A` abd `M`, 
then the  earnings under category `M` would have priority over earnings under category `A`. This means that NICs due for earnings 
under `M` are calculated first and then NIC's under category `A` are calculated where the earnings under `A` are taken  
to be above those under `M`. This is illustrated in this example:

<details>
<summary>Example - precedence of categories</summary>

```
Let us take these band limits:
  • LEL = £100
  • ET  = £150
  • UEL = £1000

This means that the maximum amounts in each band are:
+------------------------+
| band      | max amount |
|-----------|------------|
| below LEL | £100       |
| LEL - ET  | £50        |
| ET - UEL  | £850       |
| over UEL  | -          |
+------------------------+ 
 
Let us assume that a director has these earnings:

Earnings under category 'A' = £3000
Earnings under category 'M' = £175

We can calculate NICs whilst taking order of precendence into account thus:

Step 1)
Earnings under category 'M' have priority over earnings under category 'A'. Consider the £175 
earnings under cateogry 'M'. Earnings are distributed across the bands like so:

+--------------------+
| band      | amount |
|-----------|--------|
| below LEL | £100   |
| LEL - ET  | £50    |
| ET - UEL  | £25    |
| over UEL  | £0     |
+--------------------+ 

NICs are calculated according to the distribution above.

Step 2)
Consider the £3000 earnings under category 'A'. Earnings are distributed across the bands like so:

+--------------------+
| band      | amount |
|-----------|--------|
| below LEL | £0     |
| LEL - ET  | £0     |
| ET - UEL  | £825   |
| over UEL  | £2175  |
+--------------------+ 

The earnings are taken on top of the £175 earnings under category `M`. The earnings under `M` 
got up to contributing £25 to the `ET - UEL` band.
  
NICs are calculated according to the distribution above.

Step 3)
Total NICs due are the NICs due under category `M` added to the NICs due under category `A`.
```
</details>

The order of precedence changes for historical years depending on whether directors had an Appropriate Personal Pension 
or Appropriate Personal Pension Stakeholder Pension (APP). These schemes were abolished from 6th April 2012.


In-depth details about how NICs are calculated for directors can be found in the CA44 booklets published by HMRC.

## Unofficial Deferment
Before 6th April 2003, there was a maximum limit of class 1 NICs a person could be liable for. From 6th April 2003, changes 
were introduced which meant that this annual maximum was removed. All earnings in excess of the Upper Earning Limit 
(UEL) contribute to class 1 NICs liability. The removal of the annual maximum applied to people with one employment. For 
people with more than one employment, an annual maximum was retained. However, the annual maximum did not remain a static 
figure which applied to everyone. Instead, rules were laid out to calculate a person's specific annual maximum. This calculation 
is described in page `NIM01163` of the HMRC National Insurance Manual.

Under certain circumstances, a person can elect to defer paying class 1 NICs. In general, a person is eligible to defer 
payment of class 1 NICs in a specific tax year if they have more than one employment, and they expect to earn a high 
amount in that tax year. The deferment process allows a person's class 1 NICs liability and annual maximum to be retroactively 
calculated after the end of the tax year. After that calculation is made, the person is either liable to pay more class 
1 NICs if they have not paid enough class 1 NICs, or the person is due a refund if they have paid more than their annual 
maximum. The deferment process aims to prevent employees paying too much NICs and to thus prevent refunds.

Applications to defer class 1 NICs are submitted to HRMC and are due on 14th February in the tax year before deferment 
is desired. If deferment is granted, a deferment certificate is issued. There are some employers who defer class 1 NICs
without authority from Deferment Services in HMRC. This is known as unofficial deferment. 

# Project Structure

## Policy Configuration

`national-insurance.conf` is a [HOCON]("https://github.com/lightbend/config/blob/master/HOCON.md") file containing the definitions for the policy. It is designed to be comprehensible by a
non-programmer subject matter expert. Adding a new tax year would consist of copy-pasting the previous tax year and changing the
values. 

Limits and Bands are not hard-coded so adding new rules, rebates or even radically changing the policy should be viable in many
cases without code changes. More commentary is provided inside the file itself. 

## SBT Setup

The project is frontend-only as it has no transactions, state, or service dependencies. It is composed of several SBT subprojects.

## Common Code

The common code subproject contains some shared datatypes used in the project via both the play microservice and the react interface. It
also houses the actual business logic and the object which the policy configuration HOCON file is parsed into.

Due to limitations with the build pipeline the source directories are included in the play microservice via the SBT configuration
rather than added as an actual library dependency. 

### Money and Percentage 

The Money and Percentage datatypes are value classes both wrapping BigDecimal. This enables strong typing both in the code and in
the configuration file, and prevents operations that do not make sense from a business logic perspective (for example adding a
percentage to an amount of money). 

```scala
import eoi._

Money(100) + Money(200) // £300
Money(5000) * Percentage(0.01) // £50.00
Money(50) + Percentage(0.01) // compile error!
```

The arithmetic operations are made possible by use of the spire library's `Field` typeclass.

### Intervals

This service uses [intervals]("https://en.wikipedia.org/wiki/Interval_(mathematics)") to represent both ranges of dates and
amounts of money. 

For example, the rates and bands for NI change at certain points of time, typically new rates and bands are given at the start of
a new tax year, but in some cases they have changed during a tax year. 

Likewise the bands themselves represent an interval (e.g. 2% against the gross pay for earnings between £10,000 and £20,000) and
these bands can overlap with one another. 

```scala
import eoi._
import spire.math.Interval

val grossPay = Money(10000) // £10000
val taxBand = Interval.atOrAbove(Money(1400)) // [£1400, ∞)
val customerPaysTax: Boolean = Interval(Money.Zero, grossPay) intersects taxBand // true

import java.time.LocalDate

val taxYear = Interval.openUpper(
  LocalDate.of(2021, 4, 6), 
  LocalDate.of(2022, 4, 6)
) // [2021-04-06, 2022-04-06)

val isInTaxYear: Boolean = taxYear contains LocalDate.now
```

### Explained

The `Explained` type allows working to be recorded alongside steps in a calculation, this was deemed necessary as in many cases we
didn't have any authorative source of truth regarding some of the business logic as the access calculator upon which service was
based would sometimes give the wrong answers. As such we needed a way to communicate how the system had arrived at certain figures
back to stakeholders so they could tell us if it was correct or not. 

```scala
import eoi._
import cats.implicits._ 

def pythagorus(a: Int, b: Int): Explained[Double] = for {
  sa <- (a * a) gives "square of side a"
  sb <- (b * b) gives "square of side b"
  sh <- (sa + sb) gives "square of hypotenuse"
  h  <- Math.sqrt(sh) gives "hypotenuse"
} yield h

pythagorus(3,4).value // 5.0
pythagorus(3,4).explain.foreach(println)
//  square of side a = 9
//  square of side b = 16
//  square of hyponeuse = 25
//  hypontenuse = 5.0
```

Internally this is implemented as a `Writer[Vector[String],*]`.

## Microservice

The microservice is quite simple and unremarkable, its main responsibilities are the conversion of the configuration from HOCON
(which is easy to maintain) into JSON (which the react interface can consume) and providing the simple pages for the table views. 

The compiled react interface is copied into the project as part of the build process and effectively served as static content. 

## Frontend Library

The calculations are carried out in javascript on the user-agent, but the logic that performs the calculations are written in
Scala and transpiled via [Scala.js]("https://www.scala-js.org/"). 

The frontend subproject exists as a façade to the common library, mapping some datatypes and providing a more idiomatic JS
interface. 

The `sbt copyInJS` task runs `fullOptJS`, performs some replacements (using `sed`) to the resultant JS allowing it to be consumed by the
react frontend and finally copies it into the react folder. 

## React

The Javascript interface consumes the frontend library and reads the configuration as a JSON object from the microservice. 

This enables the business logic, written and tested in Scala, to be utilised on the user agent. 

Once the configuration is loaded the JS interface is no longer dependent on the microservice and will continue to run inside the users browser should the microservice be shut down.

## Running Service Locally

- Run command:
```console
sbt dist
```
- Followed by:
```console
sbt "run 8668"
```

This will start running the backend service on port 8668. 

- To run the front-end, navigate to the `react` directory and run:
```console
npm start
``` 
(also see README.md file in `react` directory)

If the application is not rendering changes made locally, a force refresh (shift F5) may be required to clear the browser cache. Alternatively, open the application in an incognito/private window.



## Maintaining Libraries and Reproducible Builds


### Building and Assembling the Project:
- When building and assembling the project, we solely rely on the provided package-lock.json.
- This means using the npm ci command instead of npm install.

### npm ci:

- Installs dependencies based on the package-lock.json file.
- Ensures that the exact versions specified in package-lock.json are installed. 

### Updating Libraries:
- When we want to update libraries, we do so consciously.
- Run npm install to update the dependencies according to the version ranges specified in package.json.
- After updating, test the project to ensure everything works correctly with the new versions.
- Once satisfied, we commit the updated package-lock.json file into version control.



### License
 
This code is open source software licensed under the [Apache 2.0 License]("http://www.apache.org/licenses/LICENSE-2.0.html").
